"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InviteMemberDialog } from "@/components/dialogs/invite-member-dialog"
import { AddUserDialog } from "@/components/dialogs/add-user-dialog"
import { UserPlus, MoreVertical, Trash2, ShieldAlert } from "lucide-react"
import { Pencil } from "lucide-react"
import { EditUserDialog } from "@/components/dialogs/edit-user-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; name: string | null } | null>(null)

  const { data: memberships, isLoading } = trpc.memberships.list.useQuery()
  const { data: currentUser } = trpc.users.getCurrent.useQuery()
  const utils = trpc.useUtils()

  // Find current user's membership to check their role
  const currentUserMembership = memberships?.find(
    (m) => m.user.email === currentUser?.email
  )
  const currentUserRole = currentUserMembership?.role
  const isOwner = currentUserRole === "OWNER"
  const isAdmin = currentUserRole === "ADMIN"
  const isOwnerOrAdmin = isOwner || isAdmin

  const updateRoleMutation = trpc.memberships.updateRole.useMutation({
    onSuccess: () => {
      utils.memberships.list.invalidate()
    },
  })

  const updateStatusMutation = trpc.memberships.updateStatus.useMutation({
    onSuccess: () => {
      utils.memberships.list.invalidate()
    },
  })

  const removeMutation = trpc.memberships.remove.useMutation({
    onSuccess: () => {
      utils.memberships.list.invalidate()
    },
  })

  const handleRoleChange = (membershipId: string, role: string) => {
    updateRoleMutation.mutate({
      membershipId,
      role: role as "USER" | "ADMIN" | "OWNER",
    })
  }

  const handleStatusChange = (membershipId: string, status: string) => {
    updateStatusMutation.mutate({
      membershipId,
      status: status as "pending" | "active" | "suspended",
    })
  }

  const handleRemove = (membershipId: string) => {
    if (
      confirm(
        "Are you sure you want to remove this member? This action cannot be undone."
      )
    ) {
      removeMutation.mutate({ membershipId })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-purple-500">Owner</Badge>
      case "ADMIN":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "USER":
        return <Badge>User</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>
        {isOwner ? (
          <Button onClick={() => setAddUserDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        ) : isAdmin ? (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldAlert className="w-4 h-4" />
            View Only - Contact admin to invite members
          </div>
        )}
      </div>

      {!isOwnerOrAdmin && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Limited Access</h3>
            <p className="text-sm text-yellow-700">
              You have read-only access to team management. Only Owners and Admins can invite members, change roles, or modify team settings.
            </p>
          </div>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500">No team members found</p>
                  {isOwner ? (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddUserDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add your first user
                    </Button>
                  ) : isAdmin ? (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite your first member
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ) : (
              memberships?.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {membership.user.avatar ? (
                        <img
                          src={membership.user.avatar}
                          alt={membership.user.name || ""}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {membership.user.name?.[0]?.toUpperCase() ||
                              membership.user.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span>{membership.user.name || "Unnamed User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{membership.user.email}</TableCell>
                  <TableCell>
                    {isOwnerOrAdmin ? (
                      <Select
                        value={membership.role}
                        onValueChange={(value) =>
                          handleRoleChange(membership.id, value)
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="OWNER">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getRoleBadge(membership.role)
                    )}
                  </TableCell>
                  <TableCell>
                    {isOwnerOrAdmin ? (
                      <Select
                        value={membership.status}
                        onValueChange={(value) =>
                          handleStatusChange(membership.id, value)
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(membership.status)
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(membership.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {isOwnerOrAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser({
                                id: membership.user.id,
                                email: membership.user.email,
                                name: membership.user.name,
                              })
                              setEditUserDialogOpen(true)
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemove(membership.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
      />
      <EditUserDialog
        open={editUserDialogOpen}
        onOpenChange={(open) => {
          setEditUserDialogOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
      />
    </div>
  )
}
