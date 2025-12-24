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
    contact: "John Doe",
    temperature: "hot" as const,
    dealValue: "$125,000",
    rating: 5,
  },
  {
    id: 2,
    company: "Tech Solutions Inc",
    contact: "Jane Smith",
    temperature: "warm" as const,
    dealValue: "$85,000",
    rating: 4,
  },
  {
    id: 3,
    company: "Global Enterprises",
    contact: "Bob Johnson",
    temperature: "cold" as const,
    dealValue: "$45,000",
    rating: 3,
  },
  {
    id: 4,
    company: "Digital Dynamics",
    contact: "Alice Williams",
    temperature: "hot" as const,
    dealValue: "$200,000",
    rating: 5,
  },
  {
    id: 5,
    company: "Innovation Labs",
    contact: "Charlie Brown",
    temperature: "warm" as const,
    dealValue: "$65,000",
    rating: 4,
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
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-10 bg-white/40 dark:bg-slate-800/40 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="glass-subtle"
              >
                All
              </Button>
              <Button
                variant={filter === "hot" ? "default" : "outline"}
                onClick={() => setFilter("hot")}
                className="glass-subtle"
              >
                Hot
              </Button>
              <Button
                variant={filter === "warm" ? "default" : "outline"}
                onClick={() => setFilter("warm")}
                className="glass-subtle"
              >
                Warm
              </Button>
              <Button
                variant={filter === "cold" ? "default" : "outline"}
                onClick={() => setFilter("cold")}
                className="glass-subtle"
              >
                Cold
              </Button>
              <Button variant="outline" className="glass-subtle">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Lead Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 dark:border-slate-700/20">
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Deal Value</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30 border-white/20 dark:border-slate-700/20"
                  onClick={() => setSelectedLead(lead.id)}
                >
                  <TableCell className="font-medium text-foreground">{lead.company}</TableCell>
                  <TableCell className="text-foreground">{lead.contact}</TableCell>
                  <TableCell>
                    <Badge variant={lead.temperature}>
                      {lead.temperature.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {lead.dealValue}
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
                    <Button variant="ghost" size="icon">
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

