"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, ChevronRight, Search, TrendingUp, Filter, CheckIcon, Loader2, Crown } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Footer } from "@/src/components/footer";
import api from "@/src/lib/axios";
import { CustomDatePicker } from "@/src/components/ui/CustomDatePicker";
import { EventItem } from "@/src/types/event";
import { useRouter } from "next/navigation";
import { useEventFilters } from "@/src/hooks/useEventFilters";
import { TICKET_AVAILABILITY_OPTIONS } from "@/src/constants/eventFilters";
import { noInteraction } from "recharts/types/state/tooltipSlice";
import HeroTicket3DLoader from "@/src/components/home/HeroTicket3DLoader";




export default function HomePage() {
  const { locale } = useParams();
  const t = useTranslations("Homepage");
  const te = useTranslations("Events");
  const router = useRouter();

  // const location = [
  //   { id: "all", name: t("location_all") },
  //   { id: "hcm", name: t("location_hcm") },
  //   { id: "hn", name: t("location_hn") },
  //   { id: "dn", name: t("location_dn") },
  // ]
  const { categoriesList } = useEventFilters();
  const genre = [
    { id: "all", name: t("genre_all") },
    ...categoriesList
  ];

  // Filters State
  const [locationSelected, setLocationSelected] = useState<any>({
    code: "all",
    name: t("location_all")
  });
  const [genreSelected, setGenreSelected] = useState(genre[0])
  const [dateSelected, setDateSelected] = useState<Date | null>(null)
  const [locationList, setLocationList] = useState<any[]>([]);

  // Events State
  const [top1TrendingEvents, setTop1TrendingEvents] = useState<EventItem | null>(null);
  const [trendingEvents, setTrendingEvents] = useState<EventItem[]>([]);
  const [latestEvents, setLatestEvents] = useState<EventItem[]>([]);
  const [liveStageEvents, setLiveStageEvents] = useState<EventItem[]>([]);
  const [stageAndArtEvents, setStageAndArtEvents] = useState<EventItem[]>([]);
  const [conferencesAndWorkshopsEvents, setConferencesAndWorkshopsEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);



  // Helper to map ticket status
  const getTicketStatusLabel = (status?: string) => {
    if (!status) return t("event_default");
    const option = TICKET_AVAILABILITY_OPTIONS.find(opt => opt.id === status);
    return option ? te(option.translationKey as any) : status;
  };

  // Fetch Latest Events
  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {

        // Fetch 4 latest events
        const response = await api.get("/inventory-service/api/events", {
          params: {
            page: 1,
            size: 4,
            sortBy: "createdAt",
            sortDirection: "DESC",
            eventStatuses: "UPCOMING",
            includeExpired: false // Only show future events in "Upcoming" section
          },
          skipAuth: true
        } as any);

        if (response.data && response.data.data && response.data.data.content) {
          console.log(response.data);
          setLatestEvents(response.data.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch latest events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchTrendingEvents = async () => {
      try {

        // Fetch 4 latest events
        const response = await api.get("/inventory-service/api/events/trending", {
          params: {
            limit: 10
          },
          skipAuth: true
        } as any);

        if (response.data && response.data.data && response.data.data.content) {
          console.log(response.data);
          setTrendingEvents(response.data.data.content);
          setTop1TrendingEvents(response.data.data.content[0]);
        }
      } catch (error) {
        console.error("Failed to fetch trending events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchLiveStageEvents = async () => {
      try {

        // Fetch 4 latest events
        const response = await api.get("/inventory-service/api/events", {
          params: {
            page: 1,
            size: 4,
            sortBy: "createdAt",
            categories: "LIVESTAGE",
            sortDirection: "DESC",
            includeExpired: false // Only show future events in "Upcoming" section
          },
          skipAuth: true
        } as any);

        if (response.data && response.data.data && response.data.data.content) {
          console.log(response.data);
          setLiveStageEvents(response.data.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch live stage events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchStageAndArtEvents = async () => {
      try {

        // Fetch 4 latest events
        const response = await api.get("/inventory-service/api/events", {
          params: {
            page: 1,
            size: 4,
            categories: "STAGE_ART",
            sortBy: "createdAt",
            sortDirection: "DESC",
            includeExpired: false // Only show future events in "Upcoming" section
          },
          skipAuth: true
        } as any);

        if (response.data && response.data.data && response.data.data.content) {
          console.log(response.data);
          setStageAndArtEvents(response.data.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch stage and art events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchConferencesAndWorkshopsEvents = async () => {
      try {

        // Fetch 4 latest events
        const response = await api.get("/inventory-service/api/events", {
          params: {
            page: 1,
            size: 4,
            categories: "WORKSHOP",
            sortBy: "createdAt",
            sortDirection: "DESC",
            includeExpired: false // Only show future events in "Upcoming" section
          },
          skipAuth: true
        } as any);

        if (response.data && response.data.data && response.data.data.content) {
          console.log(response.data);
          setConferencesAndWorkshopsEvents(response.data.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch conferences and workshops events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchListProvince = async () => {
      try {

        const response = await api.get("/iam-service/api/locations/provinces", { skipAuth: true } as any);

        if (response.data) {
          const allOption = {
            code: "all",
            name: t("location_all")
          };
          setLocationList([allOption, ...response.data]);
        }
      } catch (error) {
        console.error("Failed to fetch list province", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchTrendingEvents();
    fetchLatestEvents();
    fetchLiveStageEvents();
    fetchStageAndArtEvents();
    fetchConferencesAndWorkshopsEvents();
    fetchListProvince();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenEvent = (eventId: any) => {
    router.push(`/${locale}/user/events/${eventId}`);
  };

  const handleRedirectListings = () => {
    router.push(`/${locale}/user/resale`);
  };

  return (
    <>
      <div className="min-h-screen pb-20 bg-bg-page transition-colors duration-300">

        {/* === HERO SECTION === */}
        <div className="relative mb-32">
          <section
            className="relative w-full min-h-[600px] flex items-center justify-between pb-8 overflow-hidden group/hero"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
          >

            {/* Dynamic Animated Gradient Frame (Base - subtle) */}
            <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-amber-500 bg-[length:400%_400%] animate-gradient opacity-15 dark:opacity-25 pointer-events-none blur-3xl"></div>

            {/* Spotlight that follows mouse (Vibrant) */}
            <div
              className="absolute inset-0 w-full h-full z-0 bg-gradient-to-r from-blue-400 via-fuchsia-500 to-amber-400 bg-[length:400%_400%] animate-gradient opacity-0 group-hover/hero:opacity-80 transition-opacity duration-700 pointer-events-none blur-2xl"
              style={{
                WebkitMaskImage: `radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent 80%)`,
                maskImage: `radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent 80%)`
              }}
            ></div>

            {/* Base Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-bg-page/80 via-bg-page/60 to-bg-page/20 z-0"></div>

            <div className="w-full px-[5%] mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-visible">

              {/* Left Content */}
              <div className="lg:w-1/2 w-full flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-bg-surface hover:bg-bg-subtle transition-colors border border-border-default rounded-full px-3 py-1.5 backdrop-blur-md shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-button-primary-bg-default" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" /><rect x="7" y="14" width="3" height="3" /><rect x="14" y="14" width="3" height="3" /></svg>
                    <span className="text-xs font-medium text-text-primary">{t('Anti_copy_dynamic_QR_code')}</span>
                  </div>
                  <div onClick={() => handleRedirectListings()} className="flex items-center gap-2 bg-bg-surface hover:bg-bg-subtle transition-colors border border-border-default rounded-full px-3 py-1.5 backdrop-blur-md shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-button-primary-bg-default" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                    <span className="text-xs font-medium text-text-primary">{t('price_controller_release')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-bg-surface hover:bg-bg-subtle transition-colors border border-border-default rounded-full px-3 py-1.5 backdrop-blur-md shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-button-primary-bg-default" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                    <span className="text-xs font-medium text-text-primary">{t('AI_suggestion')}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-text-primary leading-[1.15] tracking-tight mb-6 drop-shadow-sm">{t('Own_a_transparent_ticket_to_worthwhile_experiences')}</h1>
                <p className="text-base md:text-lg text-text-secondary mb-10 max-w-[90%] font-medium leading-relaxed">
                  {t('EvoTicket_combines_modern_authentication_technology_and_intuitive_digital_experience_to_help_users_buy_tickets_with_peace_of_mind_manage_ownership_clearly_and_discover_more_suitable_events')}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link
                    href={`/${locale}/user/resale`}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                      e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                    }}
                    className="group relative overflow-hidden w-full sm:w-auto bg-button-primary-bg-default text-button-primary-text-default font-bold py-4 px-10 rounded-ds-lg shadow-lg shadow-primary/30 text-center cursor-pointer"
                  >
                    <span className="absolute w-[250%] aspect-square bg-button-accent-bg-hover rounded-full transition-transform duration-900 ease-out -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 z-0" style={{ top: 'var(--y, 50%)', left: 'var(--x, 50%)' }}></span>
                    <span className="relative z-10">{t('explore_now', { defaultMessage: 'Khám phá ngay' })}</span>
                  </Link>
                  <Link
                    href="/vi/legal/terms-of-use"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                      e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                    }}
                    className="group relative overflow-hidden w-full sm:w-auto bg-transparent border border-border-default hover:border-border-strong text-text-primary font-bold py-4 px-8 rounded-ds-lg text-center transition-colors"
                  >
                    <span className="absolute w-[250%] aspect-square bg-bg-subtle rounded-full transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 z-0" style={{ top: 'var(--y, 50%)', left: 'var(--x, 50%)' }}></span>
                    <span className="relative z-10">{t('see_more_policy')}</span>
                  </Link>
                </div>
              </div>

              {/* Right Content - Floating Tickets Graphic */}
              <div className="relative w-full lg:w-1/3 min-w-0">
                <HeroTicket3DLoader />
              </div>
            </div>
          </section>

          {/* === FLOATING FILTER BAR === */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-full px-4 lg:px-12 z-30 flex justify-center">
            <div className="w-full max-w-5xl bg-surface/80 backdrop-blur-xl border border-border shadow-lg rounded-ds-2xl p-4 md:p-6 md:px-14 md:py-10 flex flex-col md:flex-row items-center gap-4 lg:gap-6 justify-between">

              {/* Lọc: Địa điểm */}
              <div className="relative w-full md:w-[200px]">
                <label className="hidden text-xs text-txt-muted mb-1">{t("location_label")}</label>
                <Listbox value={locationSelected} onChange={(val) => setLocationSelected(val)}>
                  <ListboxButton className="w-full p-4 pl-4 pr-10 bg-main/80 border border-border rounded-ds-xl text-txt-primary outline-none focus:border-primary transition-colors text-left text-sm font-medium">
                    {locationSelected?.name || t("location_all")}
                  </ListboxButton>
                  <ListboxOptions anchor="bottom" modal={false} className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1">
                    {locationList.map(item => (
                      <ListboxOption key={item.code} value={item} className="group flex items-center px-4 py-3 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors text-sm">
                        <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-primary mr-2" />
                        <span>{item.name}</span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Listbox>
                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
              </div>

              {/* Lọc: Thể loại */}
              <div className="relative w-full md:w-[200px]">
                <label className="hidden text-xs text-txt-muted mb-1">{t("genre_label")}</label>
                <Listbox value={genreSelected} onChange={(val) => setGenreSelected(val)}>
                  <ListboxButton className="w-full p-4 pl-4 pr-10 bg-main/80 border border-border rounded-ds-xl text-txt-primary outline-none focus:border-primary transition-colors text-left text-sm font-medium">
                    {genreSelected.name}
                  </ListboxButton>
                  <ListboxOptions anchor="bottom" modal={false} className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-surface border border-border rounded-ds-xl shadow-xl text-txt-primary mt-1">
                    {genre.map(item => (
                      <ListboxOption key={item.id} value={item} className="group flex items-center px-4 py-3 cursor-pointer hover:bg-secondary rounded-ds-md transition-colors text-sm">
                        <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-primary mr-2" />
                        <span>{item.name}</span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Listbox>
                <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
              </div>

              {/* Lọc: Ngày diễn */}
              <div className="relative w-full md:w-[200px] custom-date-wrapper">
                <CustomDatePicker
                  selectedDate={dateSelected}
                  onChange={setDateSelected}
                  width="100%"
                  height="14"
                />
              </div>

              {/* Nút Tìm kiếm */}
              <div className="w-32 md:w-auto mt-2 md:mt-0 h-[50px] flex md:justify-end">
                <Link
                  href={{
                    pathname: `/${locale}/user/events`,
                    query: {
                      ...(locationSelected?.code !== 'all' && { location: locationSelected.code }),
                      ...(genreSelected?.id !== 'all' && { genres: genreSelected.id }),
                      ...(dateSelected && {
                        fromDate: dateSelected.toISOString().split('T')[0],
                        toDate: dateSelected.toISOString().split('T')[0]
                      }),
                    }
                  }}
                  className="w-full md:w-auto bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-4 py-2 rounded-ds-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Search size={18} />
                  <span>{t('search_button')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* === TRENDING EVENTS (Mocked) === */}
        <section id="trending-events" className="max-w-[90%] mx-auto px-4">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Cột trái: Danh sách (Table) */}
            <div className="lg:col-span-3 overflow-x-auto">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                {t("trending_events")} <TrendingUp className="text-button-primary-bg-default" />
              </h2>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-text-muted text-sm border-b border-border-default">
                    <th className="pb-3 text-left font-medium">{t("rank")}</th>
                    <th className="pb-3 text-left font-medium">{t("event_info")}</th>
                    <th className="pb-3 text-right font-medium">{t("floor_price")}</th>
                    <th className="pb-3 text-right font-medium">{t("volume_24h")}</th>
                    <th className="pb-3 text-right font-medium">{t("hotness")}</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingEvents.map((event, index) => (
                    <tr key={event.id} onClick={() => handleOpenEvent(event.id)} className="group hover:bg-bg-subtle transition-colors border-b border-border-default last:border-0 cursor-pointer">
                      <td className="py-4 text-center font-bold text-xl transition-colors">
                        <span className={index < 3 ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FDE599] via-[#D5A02B] to-[#996509] text-2xl" : "text-text-muted"}>{index + 1}</span>
                      </td>
                      <td className="py-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-bg-subtle flex-shrink-0 border border-border-default">
                            {event.thumbnailImage || event.bannerImage ? (
                              <Image
                                src={event.thumbnailImage || event.bannerImage || ""}
                                alt={event.eventName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-gold-light to-brand-gold-main flex items-center justify-center">
                                <Calendar size={16} className="text-white/50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-sm line-clamp-1">{event.eventName}</p>
                            <p className="text-xs text-text-muted italic">({event.organizerName})</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm text-text-secondary font-medium">
                        {event.floorPrice != null ? `${event.floorPrice.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} VND` : t("contact")}
                      </td>
                      <td className="py-4 text-right text-sm text-text-muted">
                        {event.volume24h != null ? `${event.volume24h.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} VND` : '-'}
                      </td>
                      <td className={`py-4 text-right text-sm font-bold ${event.hotness != null && event.hotness < 0 ? 'text-feedback-error-text' : 'text-feedback-success-text'}`}>
                        {event.hotness != null ? (event.hotness > 0 ? `+${event.hotness}%` : `${event.hotness}%`) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cột phải: Poster Top 1 */}
            <div className="lg:col-span-2 relative flex flex-col items-center justify-center pt-8">
              <div className="absolute top-0 w-full text-center z-10 flex flex-col items-center pb-6 pointer-events-none">
                <span
                  className="
                    relative inline-flex items-center justify-center
                    font-camaro uppercase leading-none
                    text-[2.75rem] sm:text-5xl md:text-6xl
                    tracking-[0.22em]
                    text-transparent bg-clip-text
                    bg-gradient-to-b from-white via-text-primary to-text-secondary
                    drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]
                    before:absolute before:-inset-x-5 before:-inset-y-3 before:-z-10
                    before:rounded-full before:bg-black/20 before:blur-2xl
                    after:absolute after:-bottom-3 after:left-1/2
                    after:h-px after:w-28 after:-translate-x-1/2
                    after:bg-gradient-to-r after:from-transparent after:via-primary/70 after:to-transparent
                  "
                >
                  TOP 1
                </span>
              </div>
              <div onClick={() => handleOpenEvent(top1TrendingEvents?.id)} className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden border-2 border-border-strong shadow-xl group cursor-pointer mt-4">
                {top1TrendingEvents?.thumbnailImage ? (
                  <Image
                    src={top1TrendingEvents.thumbnailImage}
                    alt={top1TrendingEvents?.eventName || "Top 1 Event"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-bg-subtle text-text-muted">
                    <Calendar size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-surface/50 to-bg-surface"></div>
                <div className="absolute bottom-6 w-full text-center text-text-primary px-4">
                  <h3 className="font-extrabold text-2xl mb-2 text-button-primary-bg-default tracking-wide">{top1TrendingEvents?.eventName}</h3>
                  <p className="text-sm opacity-80 uppercase tracking-widest font-semibold">{top1TrendingEvents?.organizerName}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* === LATEST / UPCOMING EVENTS (From API) === */}
        <section className="max-w-[90%] mx-auto px-4 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">{t("upcoming_events")}</h2>
            <Link href={`/${locale}/user/events?sort=NEWEST`} className="text-button-primary-bg-default hover:text-button-primary-bg-hover text-sm font-medium flex items-center gap-1 transition-colors">
              {t("view_all")} <ChevronRight size={16} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-button-primary-bg-default" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestEvents.length > 0 ? latestEvents.map((event) => (
                <Link key={event.id} href={`/${locale}/user/events/${event.id}`} className="block">
                  <div className="	bg-bg-surface rounded-ds-xl overflow-hidden border border-border-default hover:shadow-lg hover:shadow-primary/10 transition-all group h-full flex flex-col">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-bg-subtle">
                      {event.bannerImage ? (
                        <Image
                          src={event.bannerImage}
                          alt={event.eventName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Calendar size={32} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-button-primary-text-default text-xs px-2 py-1 rounded">
                        {getTicketStatusLabel(event.ticketAvailabilityStatus)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-text-primary text-md mb-3 line-clamp-2 min-h-[48px] group-hover:text-button-primary-bg-default transition-colors">
                        {event.eventName}
                      </h3>

                      <div className="space-y-2 text-sm text-text-muted mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-button-primary-bg-default shrink-0" />
                          <span>{formatDate(event.startDatetime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-button-primary-bg-default shrink-0" />
                          <span className="line-clamp-1">{event.venue || t("online_default")}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-default">
                        <span className="text-button-primary-bg-default font-bold block">
                          {/* Placeholder for price, as list API might not explicitly return it in sample */}
                          {/* {t("contact")} */}
                          {event.floorPrice ? <div className="text-body-base-semibold text-feedback-warning-text">
                            {t('from_price', { price: event.floorPrice?.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
                          </div> : t("contact")}
                          {/* event.floorPrice ? event.floorPrice : t("contact") */}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 text-center py-10 text-text-muted">
                  {t("no_upcoming_events")}
                </div>
              )}
            </div>
          )}
        </section>

        {/* === Livestage EVENTS (From API) === */}
        <section className="max-w-[90%] mx-auto px-4 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">{t("live_stage_events")}</h2>
            <Link href={`/${locale}/user/events?genres=LIVESTAGE`} className="text-button-primary-bg-default hover:text-button-primary-bg-hover text-sm font-medium flex items-center gap-1 transition-colors">
              {t("view_all")} <ChevronRight size={16} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-button-primary-bg-default" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStageEvents.length > 0 ? liveStageEvents.map((event) => (
                <Link key={event.id} href={`/${locale}/user/events/${event.id}`} className="block">
                  <div className="	bg-bg-surface rounded-ds-xl overflow-hidden border border-border-default hover:shadow-lg hover:shadow-primary/10 transition-all group h-full flex flex-col">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-bg-subtle">
                      {event.bannerImage ? (
                        <Image
                          src={event.bannerImage}
                          alt={event.eventName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Calendar size={32} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-button-primary-text-default text-xs px-2 py-1 rounded">
                        {getTicketStatusLabel(event.ticketAvailabilityStatus)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-text-primary text-md mb-3 line-clamp-2 min-h-[48px] group-hover:text-button-primary-bg-default transition-colors">
                        {event.eventName}
                      </h3>

                      <div className="space-y-2 text-sm text-text-muted mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-button-primary-bg-default shrink-0" />
                          <span>{formatDate(event.startDatetime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-button-primary-bg-default shrink-0" />
                          <span className="line-clamp-1">{event.venue || t("online_default")}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-default">
                        <span className="text-button-primary-bg-default font-bold block">
                          {/* Placeholder for price, as list API might not explicitly return it in sample */}
                          {/* {t("contact")} */}
                          {event.floorPrice ? <div className="text-body-base-semibold text-feedback-warning-text">
                            {t('from_price', { price: event.floorPrice?.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
                          </div> : t("contact")}
                          {/* event.floorPrice ? event.floorPrice : t("contact") */}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 text-center py-10 text-text-muted">
                  {t("no_livestage_events")}
                </div>
              )}
            </div>
          )}
        </section>

        {/* === Stage Art EVENTS (From API) === */}
        <section className="max-w-[90%] mx-auto px-4 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">{t("stage_art_events")}</h2>
            <Link href={`/${locale}/user/events?genres=STAGE_ART`} className="text-button-primary-bg-default hover:text-button-primary-bg-hover text-sm font-medium flex items-center gap-1 transition-colors">
              {t("view_all")} <ChevronRight size={16} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-button-primary-bg-default" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stageAndArtEvents.length > 0 ? stageAndArtEvents.map((event) => (
                <Link key={event.id} href={`/${locale}/user/events/${event.id}`} className="block">
                  <div className="	bg-bg-surface rounded-ds-xl overflow-hidden border border-border-default hover:shadow-lg hover:shadow-primary/10 transition-all group h-full flex flex-col">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-bg-subtle">
                      {event.bannerImage ? (
                        <Image
                          src={event.bannerImage}
                          alt={event.eventName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Calendar size={32} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-button-primary-text-default text-xs px-2 py-1 rounded">
                        {getTicketStatusLabel(event.ticketAvailabilityStatus)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-text-primary text-md mb-3 line-clamp-2 min-h-[48px] group-hover:text-button-primary-bg-default transition-colors">
                        {event.eventName}
                      </h3>

                      <div className="space-y-2 text-sm text-text-muted mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-button-primary-bg-default shrink-0" />
                          <span>{formatDate(event.startDatetime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-button-primary-bg-default shrink-0" />
                          <span className="line-clamp-1">{event.venue || t("online_default")}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-default">
                        <span className="text-button-primary-bg-default font-bold block">
                          {/* Placeholder for price, as list API might not explicitly return it in sample */}
                          {/* {t("contact")} */}
                          {event.floorPrice ? <div className="text-body-base-semibold text-feedback-warning-text">
                            {t('from_price', { price: event.floorPrice?.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
                          </div> : t("contact")}
                          {/* event.floorPrice ? event.floorPrice : t("contact") */}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 text-center py-10 text-text-muted">
                  {t("no_stage_art_events")}
                </div>
              )}
            </div>
          )}
        </section>

        {/* === Workshop EVENTS (From API) === */}
        <section className="max-w-[90%] mx-auto px-4 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">{t("workshop_events")}</h2>
            <Link href={`/${locale}/user/events?genres=WORKSHOP`} className="text-button-primary-bg-default hover:text-button-primary-bg-hover text-sm font-medium flex items-center gap-1 transition-colors">
              {t("view_all")} <ChevronRight size={16} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-button-primary-bg-default" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {conferencesAndWorkshopsEvents.length > 0 ? conferencesAndWorkshopsEvents.map((event) => (
                <Link key={event.id} href={`/${locale}/user/events/${event.id}`} className="block">
                  <div className="	bg-bg-surface rounded-ds-xl overflow-hidden border border-border-default hover:shadow-lg hover:shadow-primary/10 transition-all group h-full flex flex-col">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-bg-subtle">
                      {event.bannerImage ? (
                        <Image
                          src={event.bannerImage}
                          alt={event.eventName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Calendar size={32} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-button-primary-text-default text-xs px-2 py-1 rounded">
                        {getTicketStatusLabel(event.ticketAvailabilityStatus)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-text-primary text-md mb-3 line-clamp-2 min-h-[48px] group-hover:text-button-primary-bg-default transition-colors">
                        {event.eventName}
                      </h3>

                      <div className="space-y-2 text-sm text-text-muted mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-button-primary-bg-default shrink-0" />
                          <span>{formatDate(event.startDatetime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-button-primary-bg-default shrink-0" />
                          <span className="line-clamp-1">{event.venue || t("online_default")}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-default">
                        <span className="text-button-primary-bg-default font-bold block">
                          {/* Placeholder for price, as list API might not explicitly return it in sample */}
                          {/* {t("contact")} */}
                          {event.floorPrice ? <div className="text-body-base-semibold text-feedback-warning-text">
                            {t('from_price', { price: event.floorPrice?.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
                          </div> : t("contact")}
                          {/* event.floorPrice ? event.floorPrice : t("contact") */}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 text-center py-10 text-text-muted">
                  {t("no_workshop_events")}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
      <Footer />
    </>
  );
}
