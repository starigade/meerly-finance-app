"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Select, SelectContent, SelectItem, SelectLabel,
  SelectTrigger, SelectValue, SelectGroup, SelectSeparator,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { createAccount } from "@/lib/actions";
import { ASSET_SUB_TYPES, LIABILITY_SUB_TYPES, ACCOUNT_SUB_TYPES, COMMON_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { accountFormSchema, type AccountFormValues } from "@/lib/schemas";
import { toast } from "sonner";
import type { AccountSubType } from "@/lib/types";

export function AccountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      sub_type: "checking",
      currency: DEFAULT_CURRENCY,
      opening_balance: "",
      notes: "",
    },
  });

  const subType = form.watch("sub_type");
  const accountType = ACCOUNT_SUB_TYPES[subType as AccountSubType].type;

  const onSubmit = async (values: AccountFormValues) => {
    setLoading(true);
    const result = await createAccount({
      name: values.name.trim(),
      account_type: accountType,
      sub_type: values.sub_type as AccountSubType,
      currency: values.currency,
      opening_balance: values.opening_balance || "0",
      notes: values.notes || undefined,
    });

    if (result.success) {
      toast.success(`${values.name} created`);
      router.push("/accounts");
    } else {
      toast.error(result.error ?? "Failed to create account");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3">Add Account</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DBS Checking" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sub_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>What You Own</SelectLabel>
                        {ASSET_SUB_TYPES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ACCOUNT_SUB_TYPES[st].label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>What You Owe</SelectLabel>
                        {LIABILITY_SUB_TYPES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ACCOUNT_SUB_TYPES[st].label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="opening_balance"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any additional details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Add Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
