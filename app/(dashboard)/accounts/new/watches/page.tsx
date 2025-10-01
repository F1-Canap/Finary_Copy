"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const WatchFormSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  reference: z.string().optional(),
  production_year: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: "Year must be 4 digits",
    }),
  buy_price: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Buy price must be a number",
    }),
});
import { Watch } from "lucide-react";
type WatchFormValues = z.infer<typeof WatchFormSchema>;

export default function NewWatchPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const watchForm = useForm<WatchFormValues>({
    resolver: zodResolver(WatchFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      reference: "",
      production_year: "",
      buy_price: "",
    },
  });

  useEffect(() => {
    async function fetchSession() {
      const sess = await getSession();
      if (!sess) {
        router.push("/login");
      } else {
        setSession(sess);
      }
    }
    fetchSession();
  }, [router]);

  async function handleSubmit(values: WatchFormValues) {
    try {
      if (!session?.user._id) {
        throw new Error("User session not available");
      }

      const res = await apiClient.watches.create({
        userId: session.user._id,
        brand: values.brand,
        model: values.model,
        reference: values.reference || undefined,
        production_year: values.production_year || undefined,
        buy_price: Number(values.buy_price),
      })
      

      if (res.success) {
        toast.success("Watch added successfully ✅");
        watchForm.reset();
        setOpen(false);
      } else {
        toast.error(`Error adding watch: ${res.error}`);
        console.error("❌ Watch DB save error:", res.error);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Erreur: ${message}`);
      console.error("❌ Watch error:", err);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Add a New Watch</h1>

      {/* Selector card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="cursor-pointer" onClick={() => setOpen(true)}>
          <CardHeader className="flex flex-col items-center justify-center">
            <Watch className="w-12 h-12 text-primary" />
            <CardTitle className="mt-3">Add Watch</CardTitle>
            <CardDescription className="text-center">
              Enter the details of your watch to save it
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              variant="outline"
              className="w-full text-primary border-primary hover:bg-primary hover:text-primary"
            >
              Select
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a Watch</DialogTitle>
            <DialogDescription>
              Fill in the details of your watch. Fields marked mandatory must be
              provided.
            </DialogDescription>
          </DialogHeader>

          <Form {...watchForm}>
            <form
              onSubmit={watchForm.handleSubmit(handleSubmit)}
              className="space-y-6 max-w-md w-full"
            >
              {/* Brand */}
              <FormField
                control={watchForm.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Brand *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Omega" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model */}
              <FormField
                control={watchForm.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Model *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Speedmaster Professional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference */}
              <FormField
                control={watchForm.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Reference (optional)
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="311.30.42.30.01.005" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Production Year */}
              <FormField
                control={watchForm.control}
                name="production_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Production Year (optional)
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buy Price */}
              <FormField
                control={watchForm.control}
                name="buy_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Buy Price (in EUR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
              >
                Save Watch
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
