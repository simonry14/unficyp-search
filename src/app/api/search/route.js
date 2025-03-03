import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  // This is mock data - in a real application, you would fetch results from your database or external API
  const mockResults = [
    {
      title: `S/AGENDA/7229 - AGENDA - UNFICYP`,
      description: `United Nations S/Agenda/7229 Security Council Distr.: General 30 July 2014 Original: English 14-58484 (E) 300714 *1458484* Provisional agenda for the 7229th meeting of the Security Council To be held on Wednesday, 30 July 2014, at 10 a.m. 1. Adoption of the agenda. 2. The situation in Cyprus Report of the Secretary-General on the United Nat`,
      dataSource: "ODS",
      url: "https://documents.un.org/symbol-explorer?s=S ... 7229_4654109"
    },
    {
      title: `S/AGENDA/6231 - UNFICYP TCC`,
      description: `United Nations S/Agenda/6231 Security Council Distr.: General 7 December 2009 Original: English 09-63619 (E) 071209 *0963619* Provisional agenda for the 6231st (closed) meeting of the Security Council To be held in private on Monday, 7 December 2009, at 10.10 a.m. 1. Adoption of the agenda. 2. Meeting of the Security Council with the troop-contribu`,
      dataSource: "ODS",
      url: "https://documents.un.org/symbol-explorer?s=S/AGENDA/6231&i=S/AGENDA/6231_5724545"
    },
    {
      title: `S/AGENDA/7223 - AGENDA - TCC UNFICYP`,
      description: `United Nations S/Agenda/7223 Security Council Distr.: General 23 July 2014 Original: English 14-58155 (E) 230714 *1458155* Provisional agenda for the 7223rd (closed) meeting of the Security Council To be held in private on Wednesday, 23 July 2014, at 10 a.m. 1. Adoption of the agenda. 2. Meeting of the Security Council with the troop- and pol`,
      dataSource: "ODS",
      url: "https://documents.un.org/symbol-explorer?s=S/AGENDA/7223&i=S/AGENDA/7223_5092955"
    },
    
  ];

  // Simulate API data
  return NextResponse.json({
    results: mockResults,
    totalResults: query?.toLowerCase() === 'unficyp' ? 30036 : 1500,
    searchTime: 6.441,
    query
  });
}