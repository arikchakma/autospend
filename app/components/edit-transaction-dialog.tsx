import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { Transaction } from '~/db/types';
import { allowedCategories } from '~/lib/transaction';
import { httpPatch } from '~/lib/http';
import { toast } from 'sonner';
import { TRANSACTIONS_QUERY_KEY } from '~/queries/transaction';

type EditTransactionDialogProps = {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditTransactionDialog(props: EditTransactionDialogProps) {
  const { transaction, open, onOpenChange } = props;
  const queryClient = useQueryClient();

  const [formData, setFormData] = React.useState({
    amount: transaction.amount,
    merchant: transaction.merchant || '',
    description: transaction.description || '',
    category: transaction.category,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: typeof formData) => {
      return httpPatch(`/api/v1/transactions/${transaction.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey?.[0] === TRANSACTIONS_QUERY_KEY;
        },
      });
      toast.success('Transaction updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update transaction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeClassName="top-3 right-3"
        className="bg-white p-3 sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription className="text-balance">
            Make changes to your transaction here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="relative col-span-3">
              <span className="absolute top-[9px] left-3 text-sm text-zinc-500">
                BDT
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="pl-12"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="merchant" className="text-right">
              Merchant
            </Label>
            <Input
              id="merchant"
              value={formData.merchant}
              onChange={(e) =>
                setFormData({ ...formData, merchant: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="pt-2 text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3 resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent align="start">
                  {allowedCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
