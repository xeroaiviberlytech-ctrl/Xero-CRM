"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Edit,
  Mail,
  Phone,
  User,
  Briefcase,
  Calendar,
  TrendingUp,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  Star,
  MessageSquare,
  Users,
} from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { toast } from "sonner"
import { EditLeadDialog } from "./edit-lead-dialog"

interface LeadDetailDrawerProps {
  leadId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowOutreachHistory?: (show: boolean) => void
}

// Helper function to get initials
function getInitials(name: string): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Helper function to format currency (USD)
function formatCurrencyUSD(value: number | null | undefined): string {
  if (!value) return "$0"
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value.toFixed(0)}`
}

export function LeadDetailDrawer({
  leadId,
  open,
  onOpenChange,
  onShowOutreachHistory,
}: LeadDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleToggleOutreachHistory = () => {
    if (onShowOutreachHistory) {
      onShowOutreachHistory(true)
    }
  }

  // Fetch lead details with all related data
  const { data: lead, isLoading, error } = trpc.leads.getById.useQuery(
    { id: leadId! },
    { enabled: !!leadId && open, staleTime: 30000, retry: false }
  )

  const utils = trpc.useUtils()

  // Update lead mutation for status changes
  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.getById.invalidate({ id: leadId! })
      utils.leads.list.invalidate()
      toast.success("Lead status updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead status")
    },
  })

  const handleStatusChange = (newStatus: "hot" | "warm" | "cold") => {
    if (!leadId || !lead) return
    updateLead.mutate({
      id: leadId,
      status: newStatus,
    })
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "warm":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      case "cold":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
    }
  }

  // Get outcome icon and color
  const getOutcomeIcon = (outcome: string | null | undefined) => {
    switch (outcome) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "followup":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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

  const handleSendEmail = () => {
    const contacts = (lead as any)?.contacts || []
    const primaryContact = contacts.find((c: any) => c.isPrimary) || lead
    const email = primaryContact?.email || lead?.contactEmail
    if (email) {
      window.location.href = `mailto:${email}`
    } else {
      toast.error("No email address available for this lead")
    }
  }

  const handleCall = () => {
    const contacts = (lead as any)?.contacts || []
    const primaryContact = contacts.find((c: any) => c.isPrimary) || lead
    const phone = primaryContact?.phone || lead?.contactPhone
    if (phone) {
      window.location.href = `tel:${phone}`
    } else {
      toast.error("No phone number available for this lead")
    }
  }

  if (!leadId) return null

  const contacts = (lead as any)?.contacts || []
  const hasContacts = contacts.length > 0
  const primaryContact = hasContacts
    ? contacts.find((c: any) => c.isPrimary) || contacts[0]
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto z-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lead ? (
          <div className="space-y-6">
            {/* Header with Company Name and Status */}
            <SheetHeader className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-24">
                  <SheetTitle className="text-2xl font-bold text-foreground mb-3">
                    {lead.company}
                  </SheetTitle>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-xl glass-strong border-white/40 dark:border-slate-700/40 p-1 shadow-sm">
                      {(["hot", "warm", "cold"] as const).map((status, index) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={updateLead.isPending || lead.status === status}
                          className={`
                            relative px-4 py-1.5 text-sm font-semibold transition-all duration-200
                            ${
                              lead.status === status
                                ? getStatusColor(status) + " shadow-md scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-slate-800/20"
                            }
                            ${index !== 2 ? "border-r border-white/20 dark:border-slate-700/20 pr-4" : ""}
                            disabled:opacity-100 disabled:cursor-default
                            ${updateLead.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            rounded-lg
                          `}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons - Top Right Corner, Grouped Together */}
              <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-9 w-9 rounded-lg glass-subtle border-white/20 dark:border-slate-700/20 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:border-white/30 dark:hover:border-slate-600/30 transition-all"
                  title="Edit Lead"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-9 w-9 rounded-lg glass-subtle border-white/20 dark:border-slate-700/20 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:border-white/30 dark:hover:border-slate-600/30 transition-all opacity-70 hover:opacity-100"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {/* Approachability Rating */}
            <Card className="glass-subtle border-white/30 dark:border-slate-700/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Approachability Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (lead.rating || 0)
                                ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {lead.rating || 0}/5
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {lead.rating === 5
                        ? "Highly approachable"
                        : lead.rating === 4
                        ? "Very approachable"
                        : lead.rating === 3
                        ? "Moderately approachable"
                        : lead.rating === 2
                        ? "Somewhat approachable"
                        : lead.rating === 1
                        ? "Less approachable"
                        : "Not rated"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacts Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Contacts {hasContacts && `(${contacts.length})`}
              </h3>
              {hasContacts ? (
                <div className="space-y-3">
                  {contacts.map((contact: any) => (
                    <Card
                      key={contact.id}
                      className={`glass-subtle border-white/30 dark:border-slate-700/30 hover:glass-strong transition-all ${
                        contact.isPrimary
                          ? "border-primary/40 dark:border-primary/40"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar with Initials */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                              contact.isPrimary
                                ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                            }`}
                          >
                            {getInitials(contact.name)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Name with Primary Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground text-base">
                                {contact.name}
                              </p>
                              {contact.isPrimary && (
                                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-2.5 py-1 font-medium shadow-sm">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            
                            {/* Designation */}
                            {contact.designation && (
                              <p className="text-sm text-muted-foreground">
                                {contact.designation}
                              </p>
                            )}
                            
                            {/* Contact Info - Inline */}
                            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                              {contact.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5" />
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="hover:text-primary hover:underline truncate"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5" />
                                  <a
                                    href={`tel:${contact.phone}`}
                                    className="hover:text-primary hover:underline"
                                  >
                                    {contact.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-subtle border-primary/40 dark:border-primary/40 hover:glass-strong transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar with Initials */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 text-white">
                        {getInitials(lead.contactName)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Name with Primary Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-base">
                            {lead.contactName}
                          </p>
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-2.5 py-1 font-medium shadow-sm">
                            Primary
                          </Badge>
                        </div>
                        
                        {/* Contact Info - Inline */}
                        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                          {lead.contactEmail && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              <a
                                href={`mailto:${lead.contactEmail}`}
                                className="hover:text-primary hover:underline truncate"
                              >
                                {lead.contactEmail}
                              </a>
                            </div>
                          )}
                          {lead.contactPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              <a
                                href={`tel:${lead.contactPhone}`}
                                className="hover:text-primary hover:underline"
                              >
                                {lead.contactPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Outreach History Section - Clickable to open panel */}
            <div className="space-y-3">
              <button
                onClick={handleToggleOutreachHistory}
                className="w-full flex items-center justify-between p-3 rounded-lg glass-subtle border-white/30 dark:border-slate-700/30 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Outreach History
                  {(lead as any).outreachHistory && (lead as any).outreachHistory.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({(lead as any).outreachHistory.length})
                    </span>
                  )}
                </h3>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Show preview or empty state */}
              {(lead as any).outreachHistory && (lead as any).outreachHistory.length > 0 ? (
                <Card className="glass-subtle border-white/30 dark:border-slate-700/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Click to view outreach history
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-subtle border-white/30 dark:border-slate-700/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      No outreach history yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Deal Information Card */}
            <Card className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Deal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Source</p>
                    {(lead as any).source ? (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                      >
                        {(lead as any).source}
                      </Badge>
                    ) : (
                      <p className="font-semibold text-foreground">Not specified</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Assigned To
                    </p>
                    <p className="font-semibold text-foreground">
                      {(lead as any).assignedTo?.name || (lead as any).assignedTo?.email || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Industry</p>
                    <p className="font-semibold text-foreground">
                      {(lead as any).industry || "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-muted-foreground">
                      Conversion Probability
                    </p>
                    <span className="text-sm font-bold text-foreground">
                      {(lead as any).conversionProbability || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(lead as any).conversionProbability || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/20 dark:border-slate-700/20">
              <Button
                onClick={handleSendEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="w-full glass-strong border-white/30 dark:border-slate-700/30 font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive font-medium mb-2">
              {error.message || "Failed to load lead"}
            </p>
            <p className="text-sm text-muted-foreground">
              {error.data?.code === "FORBIDDEN"
                ? "You don't have access to this lead"
                : error.data?.code === "NOT_FOUND"
                ? "Lead not found"
                : "An error occurred while loading the lead"}
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Lead not found
          </div>
        )}

        {/* Edit Lead Dialog */}
        <EditLeadDialog
          leadId={leadId}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      </SheetContent>
    </Sheet>
  )
}
