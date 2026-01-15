"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Filter, Star, MoreVertical, Loader2, Eye, Edit, Trash2 } from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { formatDistanceToNow } from "date-fns"
import { AddLeadDialog } from "@/components/dialogs/add-lead-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)

  // Fetch leads with filters - optimized with caching
  const { data: leadsData, isLoading } = trpc.leads.list.useQuery(
    {
      status: filter === "all" ? undefined : filter,
    },
    { staleTime: 30000 } // Cache for 30 seconds
  )
  const utils = trpc.useUtils()
  
  // Delete lead mutation
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate()
      toast.success("Lead deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete lead")
    },
  })

  // Search leads if query is provided
  const { data: searchResults } = trpc.search.leads.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: searchQuery.length > 0 }
  )

  // Use search results if query exists, otherwise use filtered leads
  const leads = searchQuery.length > 0 
    ? searchResults || []
    : leadsData || []

  // Format currency
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return "₹0"
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your leads</p>
        </div>
        <Button 
          className="glass-strong border-white/30 dark:border-slate-700/30"
          onClick={() => setLeadDialogOpen(true)}
        >
          Add New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/40 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
            className={filter === "all" ? "" : "glass-subtle border-white/30 dark:border-slate-700/30"}
          >
            All
          </Button>
          <Button
            variant={filter === "hot" ? "default" : "outline"}
            onClick={() => setFilter("hot")}
            size="sm"
            className={filter === "hot" ? "" : "glass-subtle border-white/30 dark:border-slate-700/30"}
          >
            Hot
          </Button>
          <Button
            variant={filter === "warm" ? "default" : "outline"}
            onClick={() => setFilter("warm")}
            size="sm"
            className={filter === "warm" ? "" : "glass-subtle border-white/30 dark:border-slate-700/30"}
          >
            Warm
          </Button>
          <Button
            variant={filter === "cold" ? "default" : "outline"}
            onClick={() => setFilter("cold")}
            size="sm"
            className={filter === "cold" ? "" : "glass-subtle border-white/30 dark:border-slate-700/30"}
          >
            Cold
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 dark:border-slate-700/20">
                <TableHead className="text-foreground">Company</TableHead>
                <TableHead className="text-foreground">Primary Contact</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Value</TableHead>
                <TableHead className="text-foreground">Source</TableHead>
                <TableHead className="text-foreground">Last Contact</TableHead>
                <TableHead className="text-foreground">Rating</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{lead.company}</p>
                        <p className="text-xs text-muted-foreground">1 contact</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{lead.contactName}</p>
                        <p className="text-xs text-muted-foreground">{lead.contactEmail || "No email"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          lead.status === "hot" 
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                            : lead.status === "warm"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        }
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(lead.dealValue)}
                    </TableCell>
                    <TableCell className="text-foreground">-</TableCell>
                    <TableCell className="text-foreground">
                      {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < lead.rating
                                ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-white/40 dark:hover:bg-slate-800/40">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-silver border-white/30 dark:border-slate-700/30">
                          <DropdownMenuItem 
                            className="text-foreground cursor-pointer"
                            onClick={() => setSelectedLead(lead.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-foreground cursor-pointer"
                            onClick={() => {
                              setSelectedLead(lead.id)
                              // TODO: Open edit dialog
                              toast.info("Edit functionality coming soon")
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/20" />
                          <DropdownMenuItem 
                            className="text-destructive cursor-pointer focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${lead.company}?`)) {
                                deleteLead.mutate({ id: lead.id })
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Detail Drawer (placeholder) */}
      {selectedLead && (
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-foreground">Lead Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Detailed lead information will be displayed here in a drawer
              panel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Lead Dialog */}
      <AddLeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />
    </div>
  )
}

