"use client";
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import z from "zod";
import { Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select,SelectContent,SelectGroup,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
const formSchema=z.object({
  endpoint:z.url({message:"Please enter a valid Url"}),
  method:z.enum(["GET","POST","PUT","PATCH","DELETE"]),
  body:z.string().optional()
});
export type FormType=z.infer<typeof formSchema>;
interface Props{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  onSubmit:(values:z.infer<typeof formSchema>)=>void;
  defaultEndpoint?:string;
  defaultMethod?:"GET"|"POST"|"PUT"|"PATCH"|"DELETE";
  defaultBody?:string;




};
export const HttpRequestDialog=({open,onOpenChange,onSubmit,defaultBody="",defaultEndpoint="",defaultMethod="GET"}:Props)=>{
const form=useForm<z.infer<typeof formSchema>>({
  resolver:zodResolver(formSchema),
  defaultValues:{
    endpoint:defaultEndpoint,
    method:defaultMethod,
    body:defaultBody ,
  },
});
useEffect(()=>{

  if(open){
    form.reset({
      endpoint:defaultEndpoint,
      method:defaultMethod,
      body:defaultBody,
    })
  }
},[open,defaultEndpoint,defaultMethod,defaultBody,form])
const watchMethod=form.watch("method");
const showBodyField=["POST","PUT","PATCH"].includes(watchMethod);
const handleSubmit=(values:z.infer<typeof formSchema>)=>{
  onSubmit(values);
  onOpenChange(false);
}
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Http Request</DialogTitle>
            <DialogDescription>
              Configure settings for the http request node.
            </DialogDescription>
          
          </DialogHeader>
            <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Endpoint */}
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>
                  <Input placeholder="https://api.example.com/users/{{httpResponse.data.id}}" {...field} />
                  <FormDescription>
                    Static Url or use {"{{variables}}"} for simple values of {"{{json varibale}}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Method */}
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The HTTP method to use for this request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Body (conditional) */}
            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                     <Textarea
      placeholder={`{
  "userId": "{{httpResponse.data.id}}",
  "name": "{{httpResponse.data.name}}",
  "items": "{{httpResponse.data.items}}"
}`}
      className="min-h-[120px] font-mono text-sm"
      {...field}
    />
    <FormDescription>
      JSON with template variables .Use  {"{{variables}}"} for simple values of {"{{json varibale}}"} to stringify objects
    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
<DialogFooter className="mt-4">
            <Button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </Button>
            </DialogFooter>  
          </form>
        </Form>
        </DialogContent>

    </Dialog>
  )

};