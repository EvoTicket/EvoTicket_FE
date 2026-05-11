import { useTranslations } from "next-intl";
import {
    SORT_BY_OPTIONS,
    TICKET_AVAILABILITY_OPTIONS,
    DATE_FILTER_OPTIONS,
    CATEGORIES
} from "../constants/eventFilters";

export const useEventFilters = () => {
    const t = useTranslations("Events");

    const categoriesList = CATEGORIES.map(cat => ({
        id: cat.id,
        name: t(cat.translationKey as any)
    }));

    const sortByList = SORT_BY_OPTIONS.map(opt => ({
        id: opt.id,
        name: t(opt.translationKey as any)
    }));

    const ticketAvailabilityList = TICKET_AVAILABILITY_OPTIONS.map(opt => ({
        id: opt.id,
        name: t(opt.translationKey as any)
    }));

    const dateFiltersList = DATE_FILTER_OPTIONS.map(opt => ({
        id: opt.id,
        name: t(opt.translationKey as any)
    }));

    return {
        categoriesList,
        sortByList,
        ticketAvailabilityList,
        dateFiltersList
    };
};
