import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { getProject, projects } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary.en,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <CaseStudy slug={slug} />
      </main>
      <Footer />
    </>
  );
}
