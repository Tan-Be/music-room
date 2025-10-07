"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
}

interface ChatProps {
  messages: Message[]
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
  onSendMessage?: (content: string) => void
  className?: string
}

export function Chat({ messages, currentUser, onSendMessage, className }: ChatProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.elements.namedItem("message") as HTMLInputElement
    
    if (input.value.trim() && onSendMessage) {
      onSendMessage(input.value.trim())
      input.value = ""
    }
  }
  
  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="border-b">
        <h3 className="font-semibold">Чат комнаты</h3>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex gap-2",
              message.userId === currentUser?.id ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.userAvatar} alt={message.userName} />
              <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div 
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2",
                message.userId === currentUser?.id 
                  ? "bg-primary text-primary-foreground rounded-br-none" 
                  : "bg-muted rounded-bl-none"
              )}
            >
              <div className="text-xs font-medium mb-1">{message.userName}</div>
              <div>{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input 
            name="message"
            placeholder="Написать сообщение..." 
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}