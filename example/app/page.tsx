import QuoteForm from "@/components/QuoteForm";
import { BUSINESS } from "@/lib/business";

export default function Page() {
  return (
    <main className="page">
      <header className="intro">
        <h1>{BUSINESS.name}</h1>
        <p>{BUSINESS.tagline}</p>
      </header>
      <QuoteForm />
    </main>
  );
}
