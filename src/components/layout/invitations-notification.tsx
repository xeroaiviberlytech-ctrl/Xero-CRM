"use client"

import { trpc } from "@/lib/trpc/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Mail, Check, X } from "lucide-react"
import { toast } from "sonner"

export function InvitationsNotification() {
  const { data: invitations, refetch } = trpc.memberships.myInvitations.useQuery()
  const acceptMutation = trpc.memberships.acceptInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation accepted! You can now access the team workspace.")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const pendingCount = invitations?.length || 0

  if (pendingCount === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Mail className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Team Invitations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {invitations?.map((invitation) => (
          <div
            key={invitation.id}
            className="p-3 space-y-2 border-b last:border-b-0"
          >
            <div>
              <p className="font-medium text-sm">
                {invitation.tenant.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited as {invitation.role}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => acceptMutation.mutate({ membershipId: invitation.id })}
                disabled={acceptMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => toast.info("Decline functionality coming soon")}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
