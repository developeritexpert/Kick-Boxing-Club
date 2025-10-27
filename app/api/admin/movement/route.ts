// get all movements

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('movements')
      .select(
        `
        id,
        name,
        description,
        created_by,
        category:category_id ( id, name )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = [...new Set(data.map(m => m.created_by).filter(Boolean))];

    const { data: userMetaData, error: userMetaError } = await supabaseAdmin
      .from('user_meta')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds);

    if (userMetaError) {
      console.error('Error fetching user meta:', userMetaError);
    }

    const userMetaMap = new Map(
      userMetaData?.map(u => [u.user_id, u]) || []
    );


    type MovementRow = {
      id: string;
      name: string;
      description: string | null;
      category: { id: string; name: string } | { id: string; name: string }[];
      created_by: string;
    };

    const formattedData = data.map((m: MovementRow) => {
      const category =
        Array.isArray(m.category) && m.category.length > 0
          ? m.category[0].name
          : (m.category as { id: string; name: string })?.name || "Uncategorized";

      const user = m.created_by ? userMetaMap.get(m.created_by) : null;

      return {
        id: m.id,
        name: m.name,
        description: m.description,
        category,
        created_by: user
          ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
          : "Unknown",
      };
    });

    // const formattedData = data.map((m: MovementRow) => {
    //   const category =
    //     Array.isArray(m.category) && m.category.length > 0
    //       ? m.category[0].name
    //       : m.category?.name || 'Uncategorized';

    //   const user = m.created_by ? userMetaMap.get(m.created_by) : null;

    //   return {
    //     id: m.id,
    //     name: m.name,
    //     description: m.description,
    //     category,
    //     created_by: user 
    //       ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() 
    //       : 'Unknown',
    //   };
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Movements fetched successfully',
        data: formattedData,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}