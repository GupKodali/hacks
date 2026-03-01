import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

export function ProfileTabMobile() {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Account</CardDescription>
          </CardHeader>
  
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Users className="h-4 w-4" /> Preferences
              </div>
              <div className="mt-1">Activities, skill level, and location preferences.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }