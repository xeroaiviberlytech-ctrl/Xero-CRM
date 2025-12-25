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
import { Plus, Search, Filter, Star, MoreVertical } from "lucide-react"

const mockLeads = [
  {
    id: 1,
    company: "Acme Corporation",
    contactCount: 2,
    primaryContact: "John Smith",
    email: "john@acme.com",
    temperature: "hot" as const,
    dealValue: 45000,
    source: "referral",
    lastContact: "2024-01-15",
    rating: 5,
  },
  {
    id: 2,
    company: "TechStart Inc",
    contactCount: 1,
    primaryContact: "Sarah Johnson",
    email: "sarah@techstart.io",
    temperature: "warm" as const,
    dealValue: 32000,
    source: "linkedin",
    lastContact: "2024-01-14",
    rating: 4,
  },
  {
    id: 3,
    company: "Global Solutions",
    contactCount: 1,
    primaryContact: "Mike Chen",
    email: "mike@global.com",
    temperature: "cold" as const,
    dealValue: 18000,
    source: "cold_outreach",
    lastContact: "2024-01-10",
    rating: 3,
  },
]

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<number | null>(null)
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all")

  const filteredLeads =
    filter === "all"
      ? mockLeads
      : mockLeads.filter((lead) => lead.temperature === filter)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your leads</p>
        </div>
        <Button className="glass-strong border-white/30 dark:border-slate-700/30">
          Add New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
                <TableHead className="text-foreground">Temperature</TableHead>
                <TableHead className="text-foreground">Value</TableHead>
                <TableHead className="text-foreground">Source</TableHead>
                <TableHead className="text-foreground">Last Contact</TableHead>
                <TableHead className="text-foreground">Rating</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                  onClick={() => setSelectedLead(lead.id)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{lead.company}</p>
                      <p className="text-xs text-muted-foreground">{lead.contactCount} contacts</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground">{lead.primaryContact}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        lead.temperature === "hot" 
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                          : lead.temperature === "warm"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      }
                    >
                      {lead.temperature.charAt(0).toUpperCase() + lead.temperature.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    ₹{(lead.dealValue / 1000).toFixed(0)}k
                  </TableCell>
                  <TableCell className="text-foreground">{lead.source}</TableCell>
                  <TableCell className="text-foreground">{lead.lastContact}</TableCell>
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
                    <Button variant="ghost" size="icon" className="hover:bg-white/40 dark:hover:bg-slate-800/40">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  )
}

