"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Resena {
  id: number;
  nombre: string;
  calificacion: number;
  comentario: string;
  creado_en: string;
}

export default function Equipo() {
  const [isVisible, setIsVisible] = useState(false);
  const [reviews, setReviews] = useState<Resena[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formCalificacion, setFormCalificacion] = useState(0);
  const [formComentario, setFormComentario] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/resenas/`)
      .then((r) => r.json())
      .then((data) => setReviews(data))
      .catch(() => {});
  }, []);

  const submitReview = async () => {
    setError("");
    if (!formNombre.trim()) {
      setError(isVisible ? "Please enter your name" : "Ingresa tu nombre");
      return;
    }
    if (formCalificacion === 0) {
      setError(isVisible ? "Please select a rating" : "Selecciona una calificación");
      return;
    }
    if (!formComentario.trim()) {
      setError(isVisible ? "Please write a comment" : "Escribe un comentario");
      return;
    }
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_URL}/resenas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          calificacion: formCalificacion,
          comentario: formComentario.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const nueva = await res.json();
        setReviews((prev) => [nueva, ...prev].slice(0, 5));
        setSubmitted(true);
        setFormNombre("");
        setFormCalificacion(0);
        setFormComentario("");
      } else {
        const errMsg = isVisible ? "Something went wrong. Please try again." : "Algo salió mal. Intenta de nuevo.";
        setError(errMsg);
      }
    } catch (e: unknown) {
      clearTimeout(timeout);
      if (e instanceof Error && e.name === "AbortError") {
        setError(isVisible ? "Request timed out. Please try again." : "Tiempo de espera agotado. Intenta de nuevo.");
      } else {
        setError(isVisible ? "Something went wrong. Please try again." : "Algo salió mal. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="equipo" className="bg-dark section-padding">
      <div className="max-w-7xl mx-auto">

        {/* Section intro */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`h-px w-12 bg-gradient-to-r from-transparent to-gold transition-all duration-500 ${isVisible ? "opacity-100 w-16" : "opacity-0 w-0"}`} />
            <p className="text-gold text-xs tracking-[4px] uppercase">
              {isVisible && "Conoce al equipo"}
            </p>
            <span className={`h-px w-12 bg-gradient-to-l from-transparent to-gold transition-all duration-500 ${isVisible ? "opacity-100 w-16" : "opacity-0 w-0"}`} />
          </div>
          <h2 className="text-white font-black uppercase text-4xl md:text-5xl">
            {isVisible ? "The Team" : "El Equipo"}
          </h2>
          <div className={`mt-4 h-1 w-16 mx-auto bg-gold rounded-full transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
        </div>

        {/* Team photo — FIRST */}
        <div className="mb-16 relative">
          <div className="relative w-full aspect-[1/1] md:aspect-[3/1] rounded-xl overflow-hidden border border-dark-border group">
            <Image
              src="/equipo.jpeg"
              alt="Visionary Studio Team"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
            <div className={`absolute bottom-6 left-6 right-6 flex items-center justify-between transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div>
                <p className="text-gold text-xs tracking-[3px] uppercase mb-1">
                  Visionary Studio
                </p>
                <p className="text-white font-black uppercase text-xl md:text-2xl tracking-wide">
                  {isVisible ? "The Dream Team" : "El Equipo"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barbers row — 2 columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">

          {/* Columna Barbero — Lobo */}
          <div>
            <p className="text-gold text-xs tracking-[4px] uppercase mb-4">
              {isVisible && "El Maestro"}
            </p>
            <p className="text-gray-500 text-sm mb-10 max-w-md leading-relaxed">
              Barbero con más de 5 años de experiencia, especializado en cortes modernos, clásicos y freestyle.
              Carisma en el trato, precisión en cada detalle.
              Joven emprendedor y visionario, enfocado en ofrecer que cada corte destaque.
            </p>

            {/* Foto */}
            <div className="relative w-full aspect-square rounded-x1 overflow-hidden border border-dark-border group">
              <Image
                src="/lobo6.jpeg"
                alt="Alonso Lobo"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Nombre y cargo */}
            <div className="mt-4 mb-4">
              <h3 className="text-white font-black text-xl mb-1">
                Alonso <span className="text-gold">&quot;Lobo&quot;</span> Lobo
              </h3>
              <p className="text-gold text-xs tracking-wider uppercase">Owner &amp; Master Barber</p>
            </div>

            <a href="/reservar" className="btn-gold w-full text-center uppercase tracking-widest text-sm py-4 block mb-6">
              Reservar con Lobo
            </a>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-lg md:text-2xl">5+</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Años</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-lg md:text-2xl">100%</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Dedicación</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-lg md:text-2xl">4</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Servicios</p>
              </div>
            </div>
          </div>

          {/* Columna Barbero — Axel */}
          <div>
            <p className="text-gold text-xs tracking-[4px] uppercase mb-4">
              {isVisible && "El Artista"}
            </p>
            <p className="text-gray-500 text-sm mb-10 max-w-md leading-relaxed">
              Especialista en cortes modernos, degradados y diseños. 18 años con pasión por el arte de la barbería.
            </p>

            {/* Foto placeholder */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-dark-border group">
              <Image
                src="/AXEL.jpeg"
                alt="Axel Ruiz"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Nombre y cargo */}
            <div className="mt-4 mb-4">
              <h3 className="text-white font-black text-xl mb-1">
                Axel Ruiz
              </h3>
              <p className="text-gold text-xs tracking-wider uppercase">Barbero</p>
            </div>

            <a href="/reservar" className="btn-gold w-full text-center uppercase tracking-widest text-sm py-4 block mb-6">
              Reservar con Axel
            </a>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-base md:text-xl">Fades</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Especialidad</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-base md:text-xl">Diseños</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Arte</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 md:p-4 text-center">
                <p className="text-gold font-black text-lg md:text-2xl">18</p>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mt-1">Años</p>
              </div>
            </div>
          </div>

        </div>

        {/* Opiniones — full width below both barbers */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`h-px w-12 bg-gradient-to-r from-transparent to-gold transition-all duration-500 ${isVisible ? "opacity-100 w-16" : "opacity-0 w-0"}`} />
            <p className="text-gold text-xs tracking-[4px] uppercase text-center">
              {isVisible ? "What They Say" : "Lo que dicen"}
            </p>
            <span className={`h-px w-12 bg-gradient-to-l from-transparent to-gold transition-all duration-500 ${isVisible ? "opacity-100 w-16" : "opacity-0 w-0"}`} />
          </div>
          <h2 className="text-white font-black uppercase text-4xl md:text-5xl mb-8 text-center">
            {isVisible ? "Reviews" : "Voces de Distinción"}
          </h2>

          {/* Reviews list */}
          <div className="space-y-4 mb-8">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16 border border-dashed border-dark-border rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-5 h-5 md:w-6 md:h-6 text-dark-border" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm text-center max-w-xs leading-relaxed">
                  Las primeras opiniones de nuestros clientes aparecerán aquí muy pronto.
                </p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-dark-card border border-dark-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-gold font-black text-sm">{r.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{r.nombre}</p>
                        <p className="text-gray-600 text-xs">
                          {new Date(r.creado_en).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < r.calificacion ? "text-gold" : "text-dark-border"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{r.comentario}</p>
                </div>
              ))
            )}
          </div>

          {/* Leave a review button */}
          <div className="text-center border-t border-dark-border pt-6">
            <p className="text-gray-500 text-xs mb-3">¿Ya visitaste Visionary Studio?</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-gold text-xs uppercase tracking-widest font-bold hover:text-gold-light transition-colors duration-300 border-b border-gold pb-0.5"
            >
              Deja tu opinión →
            </button>
          </div>
        </div>

        {/* Review Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!submitted ? (
                <>
                  <h3 className="text-white font-black uppercase text-xl mb-1 text-center">
                    {isVisible ? "Leave a Review" : "Deja tu opinión"}
                  </h3>
                  <p className="text-gray-500 text-xs text-center mb-6">
                    {isVisible ? "Share your experience with us" : "Comparte tu experiencia con nosotros"}
                  </p>

                  <div className="mb-5">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      {isVisible ? "Your name" : "Tu nombre"}
                    </p>
                    <input
                      type="text"
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder={isVisible ? "Your name" : "Tu nombre"}
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="mb-5">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      {isVisible ? "Rating" : "Calificación"}
                    </p>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFormCalificacion(star)}
                          className="transition-transform duration-150 hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 ${star <= formCalificacion ? "text-gold" : "text-dark-border"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      {isVisible ? "Your review" : "Tu comentario"}
                    </p>
                    <textarea
                      value={formComentario}
                      onChange={(e) => setFormComentario(e.target.value)}
                      placeholder={isVisible ? "Tell us about your experience..." : "Cuéntanos tu experiencia..."}
                      rows={4}
                      maxLength={500}
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                    <p className="text-gray-600 text-xs text-right mt-1">{formComentario.length}/500</p>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs text-center mb-4">{error}</p>
                  )}

                  <button
                    onClick={submitReview}
                    disabled={loading}
                    className="btn-gold w-full text-center uppercase tracking-widest text-sm py-4 block disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (isVisible ? "Sending..." : "Enviando...") : (isVisible ? "Submit Review" : "Enviar opinión")}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-black uppercase text-xl mb-2">
                    {isVisible ? "Thank you!" : "¡Gracias!"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {isVisible
                      ? "Your review has been published for everyone to see."
                      : "Tu opinión ha sido publicada para que todos la vean."}
                  </p>
                  <button
                    onClick={() => { setShowModal(false); setSubmitted(false); }}
                    className="mt-6 text-gold text-xs uppercase tracking-widest font-bold hover:text-gold-light transition-colors border-b border-gold pb-0.5"
                  >
                    {isVisible ? "Close" : "Cerrar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
