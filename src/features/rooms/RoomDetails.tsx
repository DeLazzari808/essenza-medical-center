// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRooms } from "./useRooms";
import { supabase } from "../../services/supabase";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore, type Period } from "../../store/useBookingStore";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import PeriodSelector, { type PeriodSelection } from "../../components/PeriodSelector";
import RoomManagementCalendar from "../../components/RoomManagementCalendar";
import Lightbox from "../../components/Lightbox";
import {
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Check,
  Edit2,
  Building2,
  ArrowRight,
  Shield,
  Images,
  Sun,
  Moon,
  Stethoscope,
  Mic2,
  Theater,
  Laptop,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { calculateTotalPrice, formatPriceBRL, getPeriodLabel } from "../../lib/price";

// Mapeamento de ícones por tipo de sala
const roomTypeIcons = {
  medical: Stethoscope,
  podcast: Mic2,
  theater: Theater,
  hub: Laptop,
};

const RoomDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { fetchRoomAvailability } = useBookingStore();
  const { fetchRoom, deleteRoom } = useRooms();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodSelection[]>([]);
  const [bookedPeriods, setBookedPeriods] = useState([]);
  const [notes, setNotes] = useState("");

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isOwner = profile?.role === "owner";

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (room) {
      loadAvailability();
    }
  }, [room]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const result = await fetchRoom(id);
      if (result.success) {
        setRoom(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addMonths(new Date(), 2), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('bookings')
        .select('date, period, status')
        .eq('room_id', id)
        .gte('date', today)
        .lte('date', endDate)
        .in('status', ['pending', 'confirmed']);

      if (!error && data) {
        setBookedPeriods(data);
      }
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedPeriods.length === 0) {
      setError("Por favor, selecione pelo menos um período");
      return;
    }

    try {
      setProcessingCheckout(true);

      if (!profile?.id) {
        setError("Você precisa estar logado para fazer uma reserva");
        return;
      }

      // Chamar edge function de checkout com os períodos selecionados
      const { data, error } = await supabase.functions.invoke("checkout", {
        body: {
          room_id: room.id,
          periods: selectedPeriods,
          notes: notes,
        },
      });

      if (error) {
        console.error("Edge Function error:", error);
        if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
          setError("Sessão expirada. Por favor, faça login novamente.");
        } else if (error.message?.includes("overlap") || error.message?.includes("409")) {
          setError("Um dos períodos selecionados já está reservado. Atualize a página e tente novamente.");
        } else {
          setError(error.message || "Erro ao processar checkout. Tente novamente.");
        }
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("Falha ao iniciar pagamento. Tente novamente.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Erro ao processar checkout. Verifique sua conexão e tente novamente.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar esta sala?")) return;

    const result = await deleteRoom(id);
    if (result.success) {
      router.push("/app/rooms");
    }
  };

  const pricePerPeriod = room?.price_per_period || room?.price_per_day || room?.price_per_hour || 0;
  const totalPrice = calculateTotalPrice(pricePerPeriod, selectedPeriods.length);

  // Get room type icon
  const RoomTypeIcon = room?.room_type ? roomTypeIcons[room.room_type] || Building2 : Building2;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sala não encontrada
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/app/rooms")}>Voltar</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${activeTab === "calendar" && isOwner ? "max-w-full" : "max-w-7xl"} mx-auto px-6 py-8`}>
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => router.push("/app/rooms")}
          className="mb-8 text-gray-500 hover:text-gray-900"
        >
          ← Voltar para espaços
        </Button>

        {/* Tabs para Admin */}
        {isOwner && (
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "details"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Detalhes do Espaço
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`pb-4 px-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === "calendar"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar className="w-5 h-5" />
                Calendário e Reservas
              </button>
            </div>
          </div>
        )}

        {activeTab === "calendar" && isOwner ? (
          <RoomManagementCalendar roomId={id} />
        ) : (
          <div className={`grid grid-cols-1 ${!isOwner ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-8 items-start`}>
            {/* Conteúdo Principal */}
            <div className={`${!isOwner ? "lg:col-span-2" : "lg:col-span-1"} space-y-8`}>
              {/* Image Gallery */}
              <div className="rounded-3xl overflow-hidden shadow-soft border border-neutral-200 bg-neutral-100 relative group h-[400px] md:h-[500px]">
                {room.images && room.images.length > 0 ? (
                  <>
                    {room.images.length === 1 && (
                      <button onClick={() => openLightbox(0)} className="w-full h-full cursor-pointer">
                        <img
                          src={room.images[0]}
                          alt={room.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    )}

                    {room.images.length === 2 && (
                      <div className="grid grid-cols-2 h-full gap-1">
                        {room.images.map((img, idx) => (
                          <button key={idx} onClick={() => openLightbox(idx)} className="relative overflow-hidden cursor-pointer group/item">
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                    {room.images.length >= 3 && (
                      <div className="grid grid-cols-4 grid-rows-2 h-full gap-2">
                        <button onClick={() => openLightbox(0)} className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group/item">
                          <img src={room.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                        </button>
                        <button onClick={() => openLightbox(1)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer group/item">
                          <img src={room.images[1]} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                        </button>
                        <button onClick={() => openLightbox(2)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer group/item">
                          <img src={room.images[2]} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                        </button>
                        {room.images.length >= 4 ? (
                          <button onClick={() => openLightbox(3)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer group/item">
                            <img src={room.images[3]} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                          </button>
                        ) : (
                          <div className="col-span-1 row-span-1 bg-neutral-200" />
                        )}
                        {room.images.length >= 5 ? (
                          <button onClick={() => openLightbox(4)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer group/item">
                            <img src={room.images[4]} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" alt="" />
                            <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/30 transition-colors flex items-center justify-center">
                              {room.images.length > 5 && <span className="text-white font-bold text-lg">+{room.images.length - 5}</span>}
                            </div>
                          </button>
                        ) : (
                          <div className="col-span-1 row-span-1 bg-neutral-200" />
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => openLightbox(0)}
                      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-semibold transition-all flex items-center gap-2 hover:scale-105"
                    >
                      <Images className="w-4 h-4" />
                      Ver todas as fotos ({room.images.length})
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                    <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center">
                      <RoomTypeIcon className="w-10 h-10" />
                    </div>
                    <span className="font-medium">Sem imagens disponíveis</span>
                  </div>
                )}
              </div>

              {/* Lightbox Component */}
              <Lightbox
                images={room.images || []}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />

              {/* Título & Header Info */}
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
                        <RoomTypeIcon className="w-7 h-7 text-primary-600" />
                      </div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 leading-tight">
                        {room.title}
                      </h1>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.address}, ${room.city || ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-lg text-neutral-600 hover:text-primary-600 transition-colors group p-2 -ml-2 rounded-xl hover:bg-primary-50/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-medium underline decoration-neutral-300 underline-offset-4 group-hover:decoration-primary-300">
                      {room.address}
                      {room.city ? `, ${room.city}` : ""}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </a>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col items-center text-center justify-center gap-3 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-neutral-900">{room.capacity || '-'}</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Pessoas</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col items-center text-center justify-center gap-3 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-neutral-900">{formatPriceBRL(pricePerPeriod)}</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">/ Período</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col items-center text-center justify-center gap-3 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-neutral-900">08h-13h</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Manhã</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col items-center text-center justify-center gap-3 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-neutral-900">14h-19h</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Tarde</span>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-neutral-100">
                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <RoomTypeIcon className="w-4 h-4 text-neutral-600" />
                  </span>
                  Sobre este espaço
                </h3>
                <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed text-lg">
                  {room.description ? (
                    room.description.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                    ))
                  ) : (
                    <p className="italic text-neutral-400">Nenhuma descrição fornecida para este espaço.</p>
                  )}
                </div>
              </div>

              {/* Comodidades */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-200">
                  <h3 className="text-2xl font-display font-bold text-neutral-900 mb-8">O que este espaço oferece</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {room.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-neutral-100 hover:border-primary-200 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-neutral-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isOwner && (
                <div className="flex gap-4 pt-6 border-t border-neutral-200">
                  <Button variant="ghost" onClick={() => router.push("/app/rooms")}>← Voltar</Button>
                  <Button variant="outline" onClick={() => router.push(`/app/rooms/${id}/edit`)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>Deletar</Button>
                </div>
              )}
            </div>

            {/* Sidebar - Reserva */}
            {!isOwner && (
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Card de Preço */}
                  <Card className="p-6 border border-neutral-200 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm text-neutral-500 font-medium">Valor por período</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold text-neutral-900">{formatPriceBRL(pricePerPeriod)}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Disponível
                      </span>
                    </div>

                    <div className="border-t border-neutral-100 my-4" />

                    <div className="text-sm text-neutral-600 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span><strong>Manhã:</strong> 08h às 13h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span><strong>Tarde:</strong> 14h às 19h</span>
                      </div>
                    </div>

                    <Button variant="primary" onClick={() => setShowBookingForm(true)} className="w-full" size="lg">
                      Selecionar Períodos
                    </Button>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
                        <Shield className="w-3 h-3" />
                        Pagamento seguro via Stripe
                      </p>
                    </div>
                  </Card>

                  {/* Modal de Reserva */}
                  {showBookingForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                          <h3 className="text-xl font-bold text-neutral-900">Selecionar Períodos</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowBookingForm(false);
                              setSelectedPeriods([]);
                              setNotes("");
                              setError(null);
                            }}
                            className="text-neutral-400 hover:text-neutral-600 p-2"
                          >
                            ✕
                          </Button>
                        </div>

                        <form onSubmit={handleBooking} className="p-6 space-y-6">
                          <PeriodSelector
                            selectedPeriods={selectedPeriods}
                            onSelectionChange={setSelectedPeriods}
                            bookedPeriods={bookedPeriods}
                            pricePerPeriod={pricePerPeriod}
                          />

                          <Input
                            label="Observações (opcional)"
                            type="textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Informações adicionais para sua reserva..."
                          />

                          {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              {error}
                            </div>
                          )}

                          {selectedPeriods.length > 0 && (
                            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-primary-700 font-medium">Resumo</span>
                                <span className="text-sm text-primary-600">
                                  {selectedPeriods.length} período{selectedPeriods.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-neutral-600">Total</span>
                                <span className="text-2xl font-bold text-primary-700">{formatPriceBRL(totalPrice)}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setShowBookingForm(false);
                                setSelectedPeriods([]);
                                setNotes("");
                                setError(null);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              variant="primary"
                              className="flex-1"
                              size="lg"
                              disabled={processingCheckout || selectedPeriods.length === 0}
                            >
                              {processingCheckout ? "Processando..." : "Ir para Pagamento"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
