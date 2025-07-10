import Hero from "@/components/Common/Hero";
import ContactUs from "@/components/ContactUs";
import Content from "@/components/FAQ/Content";

type Role = "student" | "tutor";

type Props = {
  params: {
    role?: Role[];
  };
};

export default async function Home({ params }: Props) {
  const role = params.role?.[0] || "student";
  return (
    <main>
      <Hero title="faq/hero/title" description="faq/hero/description" />
      <Content role={role} />
      <ContactUs tutor={role === "tutor"} />
    </main>
  );
}

export async function generateStaticParams() {
  const roles: Role[] = ["student", "tutor"];
  return roles.map((role) => ({ role: [role] }));
}
