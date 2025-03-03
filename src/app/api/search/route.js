import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  // This is mock data - in a real application, you would fetch results from your database or external API
  const mockResults = [
    {
      title: `TD/B/CN.1/4 - PREVIOUS WORK IN UNCTAD ON TUNGSTEN AND IRON ORE : NOTE / BY THE UNCTAD SECRETARIAT`,
      description: `Distr. GENERALE TD/B/CN.1/4 10 août 1992 FRANCAIS Original : ANGLAIS CONSEIL DU COMMERCE ET DU DEVELOPPEMENT Commission permanente des produits de base Première session Genève, 19 octobre 1992 Point 4 de l'ordre du jour provisoire ORGANES SUBSIDIAIRES DE LA COMMISSION PERMANENTE (PARAGRAPHE 7 DU MANDAT DE LA COMMISSION) Travaux précédents de la CNUCED sur le tungstène et le minerai de fer`,
      dataSource: "ODS",
      url: "https://documents.un.org/symbol-explorer?s=TD/B/CN.1/4_4285785"
    },
    {
      title: `TD/B/WP/330 - EVALUATION OF UNCTAD ACTIVITIES: OVERVIEW`,
      description: `GE.24-13785 (E) Trade and Development Board Working Party on the Programme Plan and Programme Performance Eighty-eighth session Geneva, 7–11 October 2024 Item 4 (a) of the provisional agenda Evaluation of UNCTAD activities: Overview Report by the Secretary-General of UNCTAD Introduction 1. This report provides an overview of independent evaluation activities`,
      dataSource: "ODS",
      url: "https://documents.un.org/symbol-explorer?s=TD/B/WP/330_1724067920850"
    }
  ];

  // Simulate API data
  return NextResponse.json({
    results: mockResults,
    totalResults: query?.toLowerCase() === 'unctad' ? 30036 : 1500,
    searchTime: 6.441,
    query
  });
}