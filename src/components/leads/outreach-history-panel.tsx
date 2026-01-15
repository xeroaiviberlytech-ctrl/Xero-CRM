"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Phone,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

interface OutreachHistoryPanelProps {
  leadId: string | null
  open: boolean
  onClose: () => void
}

export function OutreachHistoryPanel({
  leadId,
  open,
  onClose,
}: OutreachHistoryPanelProps) {
  const { data: outreachHistory, isLoading } = trpc.outreach.getByLead.useQuery(
    { leadId: leadId! },
    { enabled: !!leadId && open, staleTime: 30000 }
  )

  // Get outcome icon
  const getOutcomeIcon = (outcome: string | null | undefined) => {
    switch (outcome) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "negative":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "followup":
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (!open || !leadId) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="glass-silver border-white/30 dark:border-slate-700/30 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Outreach History
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-white/40 dark:hover:bg-slate-800/40"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : outreachHistory && outreachHistory.length > 0 ? (
            <div className="space-y-4">
              {outreachHistory.map((outreach: any) => (
                <Card
                  key={outreach.id}
                  className="glass-subtle border-white/30 dark:border-slate-700/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getOutcomeIcon(outreach.outcome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(outreach.type)}
                            <div>
                              <p className="font-semibold text-foreground">
                                {outreach.type.charAt(0).toUpperCase() +
                                  outreach.type.slice(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {outreach.user.name || outreach.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(outreach.contactDate), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(outreach.contactDate), "hh:mm a")}
                            </p>
                          </div>
                        </div>
                        {outreach.notes && (
                          <p className="text-sm text-foreground mt-2 mb-2">
                            {outreach.notes}
                          </p>
                        )}
                        {outreach.outcome && (
                          <Badge
                            variant="outline"
                            className={`${
                              outreach.outcome === "positive"
                                ? "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                                : outreach.outcome === "negative"
                                ? "border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                                : "border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                            }`}
                          >
                            {outreach.outcome.charAt(0).toUpperCase() +
                              outreach.outcome.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No outreach history yet</p>
              <p className="text-sm mt-2">
                Start tracking your interactions with this lead
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
