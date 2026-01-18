"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bell, Shield, Users, ArrowRight } from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: currentUser, refetch } = trpc.users.getCurrent.useQuery()
  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "", // Not in schema, placeholder
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
  })

  // Update profile data when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: "",
      })
    }
  }, [currentUser?.id]) // Only update when user ID changes

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: profileData.name,
    })
  }

  const handleChangePhoto = () => {
    // TODO: Implement photo upload
    toast.info("Photo upload functionality coming soon")
  }

  const handleUpdatePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    // TODO: Implement password update via Supabase
    toast.info("Password update functionality coming soon. This will require Supabase auth integration.")
  }

  const handleSetup2FA = () => {
    // TODO: Implement 2FA setup
    toast.info("Two-factor authentication setup coming soon")
  }

  const handleToggleNotification = (type: "email" | "push") => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
    toast.success(`${type === "email" ? "Email" : "Push"} notifications ${notifications[type] ? "disabled" : "enabled"}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* User Profile */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                User Profile
              </CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              AU
            </div>
            <div>
              <Button 
                variant="outline" 
                className="glass-subtle"
                onClick={handleChangePhoto}
              >
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Full Name
              </label>
              <Input 
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="bg-white/40 dark:bg-slate-800/40 text-foreground" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <Input
                type="email"
                value={profileData.email}
                disabled
                className="bg-white/40 dark:bg-slate-800/40 text-foreground opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Phone
              </label>
              <Input 
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-white/40 dark:bg-slate-800/40 text-foreground" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Role
              </label>
              <Input 
                value={currentUser?.membership?.role === "OWNER" ? "Owner" : currentUser?.membership?.role === "ADMIN" ? "Admin" : "User"}
                disabled
                className="bg-white/40 dark:bg-slate-800/40 text-foreground opacity-60"
              />
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Notifications
              </CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <Button 
              variant={notifications.email ? "default" : "outline"} 
              size="sm" 
              className={notifications.email ? "" : "glass-subtle"}
              onClick={() => handleToggleNotification("email")}
            >
              {notifications.email ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Button 
              variant={notifications.push ? "default" : "outline"} 
              size="sm" 
              className={notifications.push ? "" : "glass-subtle"}
              onClick={() => handleToggleNotification("push")}
            >
              {notifications.push ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Security
              </CardTitle>
              <CardDescription>Manage security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button 
              variant="outline" 
              className="glass-subtle"
              onClick={handleSetup2FA}
            >
              Setup 2FA
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Change Password
            </label>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
              <Input
                type="password"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <Button 
              className="mt-4"
              onClick={handleUpdatePassword}
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Team Management
              </CardTitle>
              <CardDescription>Manage team members, roles, and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Team Members</p>
              <p className="text-sm text-muted-foreground">
                Invite and manage team members and their roles
              </p>
            </div>
            <Link href="/settings/team">
              <Button variant="outline" className="glass-subtle">
                Manage Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

