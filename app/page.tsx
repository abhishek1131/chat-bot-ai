"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Phone,
  Globe,
  Clock,
  Star,
  ArrowRight,
  Bot,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "results";
  content: string;
  timestamp: Date;
  data?: any[];
}

interface ApiResponse {
  api_url: string;
  intent: string;
}

interface EventData {
  id: string;
  title: string;
  listing_image: string;
  location: string;
  event_starts?: string;
  event_ends?: string;
  address: string;
  city: string;
  price: string;
  is_favourite: boolean;
  eventItemCategories?: Array<{ category_name: string }>;
  attractionTypes?: Array<{ attraction_type: string }>;
  categories: string;
  description?: string;
  phone?: string;
  website?: string;
}

const GreensboroLogo = ({ size = "w-12 h-12" }: { size?: string }) => (
  <div className={`${size} relative`}>
    <div className="w-full h-full bg-emerald-600 rounded-full flex items-center justify-center">
      <img
        src="/greensboro-logo.png"
        alt="Greensboro Logo"
        className="w-3/4 h-3/4 object-contain filter brightness-0 invert"
      />
    </div>
  </div>
);

const FloatingElement = ({
  children,
  className = "",
  delay = 0,
  duration = 3000,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) => (
  <div
    className={`absolute ${className}`}
    style={{
      animation: `float ${duration}ms ease-in-out infinite`,
      animationDelay: `${delay}ms`,
    }}
  >
    {children}
  </div>
);

export default function GreensboroAIChat() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setTimeout(() => {
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        container.scrollTop = container.scrollTop - 80;
      }
    }, 350);
  };

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGetStarted = () => {
    setShowWelcome(false);
    const welcomeMessage: ChatMessage = {
      id: "1",
      type: "assistant",
      content:
        "Welcome to your intelligent guide to Greensboro! I'm here to help you discover amazing events, attractions, dining, and experiences throughout the Gate City. What would you like to explore today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const callPromptAPI = async (question: string): Promise<ApiResponse> => {
    const response = await fetch("/api/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    if (!response.ok) {
      throw new Error(`Prompt API failed: ${response.status}`);
    }

    return await response.json();
  };

  const callDataAPI = async (apiUrl: string) => {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiUrl: apiUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Data API failed: ${response.status}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const apiResponse = await callPromptAPI(currentInput);
      const dataResponse = await callDataAPI(apiResponse.api_url);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I found ${
          dataResponse.data?.length || 0
        } great results for "${currentInput}". Here's what I discovered:`,
        timestamp: new Date(),
      };

      const resultsMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: "results",
        content: "",
        timestamp: new Date(),
        data: dataResponse.data || [],
      };

      setMessages((prev) => [...prev, assistantMessage, resultsMessage]);
      scrollToResults();
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I encountered an error while searching. Please try again or check your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const quickActions = [
    {
      icon: Calendar,
      text: "Events this weekend",
      query: "Show me events happening this weekend",
    },
    {
      icon: MapPin,
      text: "Downtown attractions",
      query: "What attractions are in downtown Greensboro?",
    },
    {
      icon: Star,
      text: "Free activities",
      query: "Find free things to do today",
    },
    {
      icon: Clock,
      text: "Historic sites",
      query: "Show me historic sites and museums",
    },
  ];

  if (showWelcome) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ paddingTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/greensboro-downtown.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-l from-emerald-500/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <FloatingElement
            className="top-1/4 left-1/4"
            delay={0}
            duration={8000}
          >
            <div className="p-3 glass-card rounded-2xl">
              <Cpu className="w-6 h-6 text-white/60" />
            </div>
          </FloatingElement>
          <FloatingElement
            className="top-1/3 right-1/4"
            delay={3000}
            duration={9000}
          >
            <div className="p-3 glass-card rounded-2xl">
              <Bot className="w-7 h-7 text-white/60" />
            </div>
          </FloatingElement>
          <FloatingElement
            className="bottom-1/3 left-1/3"
            delay={6000}
            duration={7000}
          >
            <div className="p-3 glass-card rounded-2xl">
              <Sparkles className="w-6 h-6 text-white/60" />
            </div>
          </FloatingElement>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="mb-12 animate-fade-in">
            <div className="mb-10 flex justify-center">
              <div className="relative">
                <GreensboroLogo size="w-28 h-28" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black font-[family-name:var(--font-montserrat)] text-white mb-4 tracking-tight drop-shadow-2xl">
              Explore Greensboro
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium font-[family-name:var(--font-open-sans)] text-white/90 mb-8 drop-shadow-lg">
              Your AI-Powered City Guide
            </h2>
          </div>

          <div className="max-w-3xl mb-12 animate-slide-up">
            <p className="text-xl text-white leading-relaxed mb-6 font-medium font-[family-name:var(--font-open-sans)] drop-shadow-lg">
              Discover the best of the Gate City with personalized
              recommendations for
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent font-semibold">
                {" "}
                events, dining, attractions, and experiences
              </span>
              .
            </p>
            <p className="text-white/80 text-lg font-[family-name:var(--font-open-sans)] drop-shadow-md">
              Powered by advanced AI to help you explore like a local
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover-lift cursor-pointer group hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors duration-300">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-sm font-medium font-[family-name:var(--font-open-sans)] group-hover:text-white transition-colors duration-300">
                  {action.text}
                </p>
              </div>
            ))}
          </div>

          <div className="animate-slide-up pb-16">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 text-white px-12 text-xl font-semibold font-[family-name:var(--font-montserrat)] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <Sparkles className="w-6 h-6 mr-3 relative z-10" />
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      <style>{`
        .welcome-message {
          position: sticky;
          top: 80px;
          z-index: 20;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .chat-container {
          margin-top: 160px;
          height: calc(100vh - 240px);
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute inset-0 opacity-[0.02]">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-border/20"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border h-20">
        <div className="px-6 py-4 h-full">
          <div className="flex items-center gap-4 h-full">
            <div className="relative">
              <GreensboroLogo size="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                Explore Greensboro AI
              </h1>
              <p className="text-sm text-muted-foreground font-[family-name:var(--font-open-sans)]">
                Your intelligent guide to the Gate City
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-15 px-6 pb-40 relative z-10 ">
        <div className="max-w-6xl mx-auto space-y-8 py-6 mt-10 ">
          {messages.map((message) => (
            <div key={message.id} className="animate-slide-up">
              {message.type === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-md px-6 py-4 max-w-xl shadow-lg">
                    <p className="text-sm font-medium font-[family-name:var(--font-open-sans)] text-white">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : message.type === "assistant" ? (
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0">
                    <GreensboroLogo size="w-10 h-10" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-bl-md px-6 py-4 max-w-xl">
                    <p className="text-sm text-card-foreground font-medium font-[family-name:var(--font-open-sans)]">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4" ref={resultsRef}>
                  <div className="w-10 h-10 flex-shrink-0">
                    <GreensboroLogo size="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {message.data?.map((item: EventData, index: number) => (
                        <Card
                          key={item.id}
                          className="group overflow-hidden hover-lift glass-card rounded-2xl border-border hover:border-emerald-600/20"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="relative overflow-hidden rounded-t-2xl h-48">
                            <img
                              src={item.listing_image || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-200"
                            />
                            <div className="absolute bottom-0 left-2 mb-2 mr-2">
                              <Badge className="bg-emerald-500/90 text-emerald-foreground hover:bg-emerald-600 font-medium px-3 py-1 rounded-full text-white">
                                {item.categories}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-semibold text-card-foreground mb-4 text-base line-clamp-2 group-hover:text-emerald-600 transition-colors font-[family-name:var(--font-montserrat)]">
                              {item.title}
                            </h3>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="truncate font-medium font-[family-name:var(--font-open-sans)]">
                                  {item.address}, {item.city}
                                </span>
                              </div>

                              {item.event_starts && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <span className="font-medium font-[family-name:var(--font-open-sans)]">
                                    {formatDate(item.event_starts)}
                                    {item.event_ends &&
                                      item.event_ends !== item.event_starts &&
                                      ` - ${formatDate(item.event_ends)}`}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="font-semibold text-emerald-600 text-sm font-[family-name:var(--font-open-sans)]">
                                  {item.price === "0" || item.price === "free"
                                    ? "Free"
                                    : item.price}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.eventItemCategories
                                ?.slice(0, 2)
                                .map((cat, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="border-emerald-400/20 text-emerald-600 bg-emerald-500/5 rounded-full px-4 py-2 text-base"
                                  >
                                    {cat.category_name}
                                  </Badge>
                                ))}
                              {item.attractionTypes
                                ?.slice(0, 2)
                                .map((type, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="border-emerald-400/20 text-emerald-600 bg-emerald-500/5 rounded-full px-4 py-2 text-base"
                                  >
                                    {type.attraction_type}
                                  </Badge>
                                ))}
                            </div>

                            <Button
                              onClick={() => setSelectedItem(item)}
                              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-emerald-foreground font-medium py-2 rounded-xl transition-all duration-300 hover-lift font-[family-name:var(--font-open-sans)]"
                            >
                              <ExternalLink
                                className="w-4 h-4 mr-2"
                                color="white"
                              />
                              <span className="text-white">View Details</span>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-slide-up">
              <div className="w-10 h-10 flex-shrink-0">
                <GreensboroLogo size="w-10 h-10" />
              </div>
              <div className="glass-card rounded-2xl rounded-bl-md px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium font-[family-name:var(--font-open-sans)]">
                    Searching Greensboro...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40">
        <div className="px-6">
          <div className="flex flex-wrap gap-3 max-w-4xl mx-auto justify-center mb-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(action.query)}
                className="backdrop-blur-xl bg-background/90 border border-border text-foreground hover:bg-emerald-500/20 hover:border-emerald-500/50 rounded-xl px-4 py-2 font-medium transition-all duration-300 hover-lift shadow-lg font-[family-name:var(--font-open-sans)]"
                disabled={isLoading}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <action.icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{action.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border z-50">
        <div className="px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about events, attractions, dining, or things to do in Greensboro..."
                className="flex-1 border-border focus:border-emerald-500 focus:ring-emerald-500/20 h-12 text-sm rounded-xl px-4 pr-12 placeholder:text-muted-foreground/60 font-medium font-[family-name:var(--font-open-sans)] text-foreground bg-background border shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <GreensboroLogo size="w-6 h-6" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white w-12 h-12 rounded-xl transition-all duration-300 hover-lift shadow-lg border-0"
            >
              <Send
                className={`w-4 h-4 text-white ${
                  isLoading ? "animate-pulse" : ""
                }`}
              />
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-effect border border-emerald-400/20 rounded-3xl backdrop-blur-2xl shadow-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-foreground pr-10">
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8">
                <div className="relative">
                  <img
                    src={selectedItem.listing_image || "/placeholder.svg"}
                    alt={selectedItem.title}
                    className="w-full h-64 object-cover rounded-3xl shadow-xl bg-gray-200"
                  />
                </div>

                {selectedItem.description && (
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {selectedItem.description}
                  </p>
                )}

                <div className="grid gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-lg">
                      {selectedItem.address}, {selectedItem.city}
                    </span>
                  </div>

                  {selectedItem.phone && (
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg">
                        <Phone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <a
                        href={`tel:${selectedItem.phone}`}
                        className="font-semibold text-lg text-emerald-600 hover:underline"
                      >
                        {selectedItem.phone}
                      </a>
                    </div>
                  )}

                  {selectedItem.website && (
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg">
                        <Globe className="w-6 h-6 text-emerald-600" />
                      </div>
                      <a
                        href={selectedItem.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-lg text-emerald-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {selectedItem.event_starts && (
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-lg">
                        {formatDate(selectedItem.event_starts)}
                        {selectedItem.event_ends &&
                          selectedItem.event_ends !==
                            selectedItem.event_starts &&
                          ` - ${formatDate(selectedItem.event_ends)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-bold text-emerald-600 text-xl">
                      {selectedItem.price === "0" || item.price === "free"
                        ? "Free"
                        : selectedItem.price}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedItem.eventItemCategories?.map((cat, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-emerald-400/20 text-emerald-600 bg-emerald-500/5 rounded-full px-4 py-2 text-base"
                    >
                      {cat.category_name}
                    </Badge>
                  ))}
                  {selectedItem.attractionTypes?.map((type, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-emerald-400/20 text-emerald-600 bg-emerald-500/5 rounded-full px-4 py-2 text-base"
                    >
                      {type.attraction_type}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
