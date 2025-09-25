"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { CheckCircle2, EyeOff, AlertCircle, Eye, X, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

// --- Validation Schema ---
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({}: React.ComponentProps<"div">) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = form.watch("password")
  const confirmPassword = form.watch("confirmPassword")
  const watchedEmail = form.watch("email")
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const checks = [
    {
      label: "At least 6 characters",
      valid: password?.length >= 6,
      icon: password?.length >= 6 ? CheckCircle2 : AlertCircle,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password || ""),
      icon: /[A-Z]/.test(password || "") ? CheckCircle2 : AlertCircle,
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password || ""),
      icon: /[a-z]/.test(password || "") ? CheckCircle2 : AlertCircle,
    },
    {
      label: "One special character",
      valid: /[^a-zA-Z0-9]/.test(password || ""),
      icon: /[^a-zA-Z0-9]/.test(password || "") ? CheckCircle2 : AlertCircle,
    },
  ]
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const confirmPasswordTouched = form.formState.touchedFields.confirmPassword
  const isEmailValid = watchedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail)


  async function onSubmit(values: RegisterFormValues) {
    console.log("Register values:", values)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        throw new Error("Registration failed")
      }

      const data = await res.json()
      console.log("Registration success:", data)
      // redirection, login auto ou message de succès ici
    } catch (err) {
      console.error("Register failed:", err)
      form.setError("email", {
        type: "manual",
        message: "Email already in use",
      })
    }
  }

  return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Register with your email and start using the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>

                        <div className="relative">
                          <Input
                            placeholder="m@example.com"
                            type="email"
                            {...field}
                          />
                          {watchedEmail && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isEmailValid ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10"
                            {...field}
                            onFocus={() => {
                              setIsPasswordFocused(true)
                            }}
                            onBlur={() => {
                              setIsPasswordFocused(false)
                            }}
                          />
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </FormControl>

                      {/* Affiche les checks uniquement si focus */}
                      {isPasswordFocused && (
                        <div className="grid grid-cols-1 gap-1 mt-2 animate-fadeIn">
                          {checks.map((check) => {
                            const IconComponent = check.icon
                            return (
                              <div
                                key={check.label}
                                className={`flex items-center gap-2 text-xs transition-all duration-200 ${
                                  check.valid
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <IconComponent
                                  className={`h-3.5 w-3.5 transition-colors ${
                                    check.valid
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span className={check.valid ? "font-medium" : ""}>
                                  {check.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />


              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pr-10"
                          {...field}
                        />
                        <div className={cn("absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-2")}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    {confirmPasswordTouched && confirmPassword && (
                      <div
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          passwordsMatch
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {passwordsMatch ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          <span>
                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                          </span>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  )
}
