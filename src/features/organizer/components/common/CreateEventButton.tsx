"use client";

import { useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { organizerEventApi } from "@/src/features/organizer/api/organizerEventApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreateEventButtonProps {
    children: React.ReactNode;
    className?: string;
    onDraftSelect?: () => void;
}

export function CreateEventButton({ children, className, onDraftSelect }: CreateEventButtonProps) {
    const { locale } = useParams();
    const router = useRouter();
    const t = useTranslations("CreateEvent.Wizard"); // Adjust translation as needed

    const [isChecking, setIsChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        setIsChecking(true);
        try {
            const { count } = await organizerEventApi.getCurrentDrafts();
            console.log(count)
            if (count > 0) {
                setShowModal(true);
            } else {
                await handleCreateNew();
            }
        } catch (error) {
            console.error("Failed to check drafts", error);
            // Fallback: just go to create page
            router.push(`/${locale}/organizer/events/create`);
        } finally {
            setIsChecking(false);
        }
    };

    const handleCreateNew = async () => {
        try {
            setIsChecking(true);
            const { eventId } = await organizerEventApi.initDraft();
            setShowModal(false);
            router.push(`/${locale}/organizer/events/create?draftId=${eventId}&isNew=true`);
        } catch (error) {
            console.error("Failed to init draft", error);
            router.push(`/${locale}/organizer/events/create`);
        } finally {
            setIsChecking(false);
        }
    };

    const pathname = usePathname();

    const handleEditDraft = () => {
        setShowModal(false);
        if (onDraftSelect) {
            onDraftSelect();
        } else if (pathname?.endsWith("/center")) {
            // Dispatch a custom event so OrganizerCenterPage can listen to it
            // and update its activeTab without a Next.js router push
            window.dispatchEvent(new CustomEvent("switchTab", { detail: "draft" }));

            // Also softly update the URL for consistency
            window.history.pushState(null, "", `/${locale}/organizer/events/center?tab=draft`);
        } else {
            router.push(`/${locale}/organizer/events/center?tab=draft`);
        }
    };

    return (
        <>
            <button onClick={handleClick} className={className} disabled={isChecking}>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                {children}
            </button>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bản nháp hiện tại</DialogTitle>
                        <DialogDescription>
                            Bạn đang có bản nháp chưa hoàn thành. Bạn muốn tiếp tục chỉnh sửa hay tạo sự kiện mới?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={handleCreateNew}>
                            Tạo sự kiện mới
                        </Button>
                        <Button variant="primary" onClick={handleEditDraft}>
                            Sửa bản nháp
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
