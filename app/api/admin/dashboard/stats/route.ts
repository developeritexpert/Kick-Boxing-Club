// get movement counts for dashboard

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {

        const { data: movements, error: movementsError } = await supabaseAdmin
            .from('movements')
            .select(
                `
                    id,
                    sub_category,
                    category:category_id ( id, name )
                `,
            );

        if (movementsError) {
            return NextResponse.json({ error: movementsError.message }, { status: 500 });
        }

        if (!movements) {
            return NextResponse.json(
                {
                    success: true,
                    boxingCount: 0,
                    kickBoxingCount: 0,
                    hiitUpperCount: 0,
                    hiitLowerCount: 0,
                    hiitFullBodyCount: 0,
                },
                { status: 200 },
            );
        }

        let boxingCount = 0;
        let kickBoxingCount = 0;
        let hiitUpperCount = 0;
        let hiitLowerCount = 0;
        let hiitFullBodyCount = 0;

        movements.forEach((movement: any) => {
            const categoryName = Array.isArray(movement.category)
                ? movement.category[0]?.name
                : movement.category?.name;

            const subCategory = movement.sub_category?.trim().toLowerCase();

            if (categoryName === 'Boxing') {
                boxingCount++;
            } else if (categoryName === 'Kickboxing') {
                kickBoxingCount++;
            }

            if (categoryName === 'HIIT' && subCategory) {
                if (subCategory === 'upper body') {
                    hiitUpperCount++;
                } else if (subCategory === 'lower body') {
                    hiitLowerCount++;
                } else if (subCategory === 'full body') {
                    hiitFullBodyCount++;
                }
            }
        });

        let allUpperCount = 0;
        let allLowerCount = 0;
        let allFullBodyCount = 0;

        movements.forEach((movement: any) => {
            const subCategory = movement.sub_category?.trim().toLowerCase();

            if (subCategory) {
                if (subCategory === 'upper body') {
                    allUpperCount++;
                } else if (subCategory === 'lower body') {
                    allLowerCount++;
                } else if (subCategory === 'full body') {
                    allFullBodyCount++;
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Movement counts fetched successfully',
                data: {
                    boxingCount,
                    kickBoxingCount,
                    hiitUpperCount,
                    hiitLowerCount,
                    hiitFullBodyCount,
                    hiitTotalCount: hiitUpperCount + hiitLowerCount + hiitFullBodyCount,
                    allUpperCount,
                    allLowerCount,
                    allFullBodyCount,
                    allCategorizedCount: allUpperCount + allLowerCount + allFullBodyCount,
                },
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