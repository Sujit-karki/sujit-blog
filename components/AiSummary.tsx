import { getAiSummary } from '@/lib/ai-summary'
import AiSummaryCard from '@/components/AiSummaryCard'

interface Props {
  slug: string
}

export default async function AiSummary({ slug }: Props) {
  const data = await getAiSummary(slug)
  return <AiSummaryCard data={data} />
}
