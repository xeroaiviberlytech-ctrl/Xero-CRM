"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bell, Shield, Users } from "lucide-react"

export default function SettingsPage() {
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
              <Button variant="outline" className="glass-subtle">
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
              <Input defaultValue="Admin User" className="bg-white/40 dark:bg-slate-800/40 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <Input
                type="email"
                defaultValue="admin@xerocrm.com"
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Phone
              </label>
              <Input defaultValue="+1 (555) 123-4567" className="bg-white/40 dark:bg-slate-800/40 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Role
              </label>
              <Input defaultValue="Administrator" className="bg-white/40 dark:bg-slate-800/40 text-foreground" />
            </div>
          </div>
          <Button className="mt-4">Save Changes</Button>
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
            <Button variant="outline" size="sm" className="glass-subtle">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Button variant="outline" size="sm" className="glass-subtle">
              Enable
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
            <Button variant="outline" className="glass-subtle">
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
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
              <Input
                type="password"
                placeholder="New password"
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <Button className="mt-4">Update Password</Button>
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
                Team Integrations
              </CardTitle>
              <CardDescription>Manage team settings and integrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Team management and integration settings will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

