import { redirect } from "next/navigation";

type Props = { params: { locale: string } };

export default function OrganizerPage({ params }: Props) {
  redirect(`/${params.locale}/organizer/center`);
}
