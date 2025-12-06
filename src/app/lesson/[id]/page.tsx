import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LessonRoom from "@/components/lesson/LessonRoom";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Pass necessary user info to the client component
  const currentUser = {
    id: session.user.id,
    name: session.user.name || "User",
    image: session.user.image,
  };

  return (
    <LessonRoom
      lessonId={id}
      currentUser={currentUser}
    />
  );
}
