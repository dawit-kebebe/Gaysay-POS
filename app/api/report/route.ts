import connectToDatabase from '@/app/common/database'
import PurchaseModel from '@/app/common/database/models/Purchase'
import SellsModel from '@/app/common/database/models/Sells'
import { Menu } from '@/app/common/types/menu'
import { ReportFilters } from '@/app/common/types/report'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Handles GET requests to /api/expense
 * Filters expenses based on a 'filter' query parameter:
 * expense?filter=today
 * expense?filter=this-week
 * expense?filter=this-month
 * expense?filter=this-year
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter')
    const now = new Date()
    let startDate: Date
    let endDate: Date

    try {
        switch (filter) {
            case ReportFilters.TODAY:
                startDate = startOfDay(now)
                endDate = endOfDay(now)
                break
            case ReportFilters.LAST_WEEK:
                startDate = startOfDay(subDays(now, 7))
                endDate = endOfDay(now)
                break
            case ReportFilters.LAST_MONTH:
                startDate = startOfDay(subDays(now, 30))
                endDate = endOfDay(now)
                break
            case ReportFilters.LAST_YEAR:
                startDate = startOfDay(subDays(now, 365))
                endDate = endOfDay(now)
                break
            default:
                return NextResponse.json(
                    { message: "Invalid or missing 'filter' query parameter. Must be one of: today, this-week, this-month, this-year." },
                    { status: 400 }
                )
        }

        await connectToDatabase();

        const expenses = await PurchaseModel.find({
            createdAt: {
                $gte: startDate, // Greater than or equal to the start date
                $lte: endDate    // Less than or equal to the end date
            },
            isClosed: true // You might only want to count closed/finalized purchases
        });

        const totalExpenseAmount = expenses.reduce((sum, expense) => sum + (expense.unitPrice * expense.quantity), 0)

        if (!mongoose.models.Menu) {
            await import('@/app/common/database/models/Menu')
        }

        const income = await SellsModel.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            },
            isClosed: true
        }).populate('itemId');

        const totalIncomeAmount = income.reduce((sum, sell) => {
            const qty = Number(sell.totalFreq ?? 0)
            // if itemId is populated, it will be an object with price; otherwise it's an ObjectId
            const item = sell.itemId as unknown as Menu
            const price = Number(item?.price ?? 0)
            return sum + qty * price
        }, 0)

        return NextResponse.json({
            filter: filter,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            data: {
                expense: {
                    totalExpenseItems: expenses.length,
                    totalAmount: totalExpenseAmount,
                    expenses: expenses
                },
                income: {
                    totalIncomeItems: income.length,
                    totalAmount: totalIncomeAmount,
                    incomes: income
                }
            }
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching expenses:", error)
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 })
    }
}