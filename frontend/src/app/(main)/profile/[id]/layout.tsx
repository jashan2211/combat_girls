// Generate static params for all known athlete slugs
export function generateStaticParams() {
  return [
    'amanda-nunes', 'valentina-shevchenko', 'zhang-weili', 'rose-namajunas',
    'alexa-grasso', 'holly-holm', 'kayla-harrison', 'mackenzie-dern',
    'ronda-rousey', 'joanna-jedrzejczyk', 'jessica-andrade',
    'carla-esparza', 'jessica-eye', 'miesha-tate', 'cat-zingano',
    'julianna-pena', 'amanda-ribas', 'marina-rodriguez', 'yan-xiaonan',
    'tracy-cortez', 'maycee-barber', 'andrea-lee', 'rachael-ostovich',
    'manon-fiorot', 'erin-blanchfield', 'raquel-pennington',
    'megan-oneal', 'charlize-balser', 'teshya-alo', 'ayane-jasinski',
    'mary-barron', 'yurivia-jimenez', 'veronica-vargas',
  ].map((id) => ({ id }));
}

// Allow dynamic params not in the list (client-side routing will handle them)
export const dynamicParams = true;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
