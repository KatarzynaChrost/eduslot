"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const bookingSchema = z.object({
  slot_ids: z.array(z.number()).min(1, "Wybierz co najmniej jeden termin"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Slot {
  id: number;
  day: string;
  hour: string;
  is_booked: boolean;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  max_slots: number;
  bookings: Array<{
    id: number;
    slot_id: number;
    slots: {
      day: string;
      hour: string;
    };
  }>;
}

const dayOrder = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

export default function StudentBookingPage() {
  const params = useParams();
  const link = params.link as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    fetchStudentAndSlots();
  }, [link]);

  const fetchStudentAndSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const studentResponse = await fetch(`/api/students/link/${link}`);
      if (!studentResponse.ok) {
        throw new Error("Nie znaleziono ucznia");
      }
      const studentData = await studentResponse.json();
      setStudent(studentData);

      const slotsResponse = await fetch("/api/slots/all");
      if (!slotsResponse.ok) {
        throw new Error("Nie udało się pobrać terminów");
      }
      const slotsData = await slotsResponse.json();
      setSlots(slotsData);

      const currentSlotIds = studentData.bookings.map((b: any) => b.slot_id);
      setSelectedSlots(currentSlotIds);
      setValue("slot_ids", currentSlotIds);
    } catch (error) {
      console.error("[v0] Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!student) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: student.id,
          slot_ids: data.slot_ids,
        }),
      });

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: "Błąd serwera" }));
        throw new Error(result.error || "Błąd podczas rezerwacji");
      }

      toast({
        title: "Rezerwacja zaktualizowana!",
        description: `Zarezerwowano ${data.slot_ids.length} terminów`,
      });

      fetchStudentAndSlots();
    } catch (error) {
      console.error("[v0] Booking error:", error);
      toast({
        title: "Błąd",
        description:
          error instanceof Error
            ? error.message
            : "Nie udało się zarezerwować terminu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSlot = (slotId: number, isBookedByOther: boolean) => {
    if (isBookedByOther) return;

    const newSelectedSlots = selectedSlots.includes(slotId)
      ? selectedSlots.filter((id) => id !== slotId)
      : [...selectedSlots, slotId];

    setSelectedSlots(newSelectedSlots);
    setValue("slot_ids", newSelectedSlots);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Ładowanie...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {error || "Nie znaleziono ucznia"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const currentBookedSlotIds = student.bookings.map((b) => b.slot_id);
  const hasChanges =
    JSON.stringify([...selectedSlots].sort()) !==
    JSON.stringify([...currentBookedSlotIds].sort());

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-balance">
            Witaj <span className="text-accent">{student.first_name}!</span>
          </h1>
          <p className="text-muted-foreground mt-1">Rezerwacja terminów</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Twoje rezerwacje</CardTitle>
              <CardDescription>
                Możesz zarezerwować {student.max_slots}{" "}
                {student.max_slots === 1 && "termin"}
                {student.max_slots > 1 && "terminy"}
                {(student.max_slots > 5 || !student.max_slots) && "terminów"}.
                Każda lekcja trwa godzinę.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.bookings.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2">
                    Twoje zarezerwowane terminy:
                  </p>
                  {student.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        {booking.slots.day} - {booking.slots.hour}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nie masz jeszcze żadnych rezerwacji
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Wybierz terminy</CardTitle>
              <CardDescription>
                Możesz zmienić swoje rezerwacje. Wybierz maksymalnie{" "}
                {student.max_slots} {student.max_slots === 1 && "termin"}
                {student.max_slots > 1 && "terminy"}
                {(student.max_slots > 5 || !student.max_slots) && "terminów"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasChanges ? (
                <Alert className="mb-4 p-3 border-destructive text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    Masz niezapisane zmiany. Kliknij "Zapisz rezerwacje", aby je
                    zatwierdzić.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="h-[62px]" />
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(groupedSlots)
                    .sort(
                      ([dayA], [dayB]) =>
                        dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB)
                    )
                    .map(([day, daySlots]) => {
                      const availableSlots = daySlots.filter((slot) => {
                        const isBookedByMe = currentBookedSlotIds.includes(
                          slot.id
                        );
                        const isBookedByOther = slot.is_booked && !isBookedByMe;
                        return !isBookedByOther;
                      });

                      if (availableSlots.length === 0) return null;

                      return (
                        <div key={day}>
                          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {day}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {availableSlots.map((slot) => {
                              const isSelected = selectedSlots.includes(
                                slot.id
                              );
                              const canSelect =
                                selectedSlots.length < student.max_slots ||
                                isSelected;

                              return (
                                <div
                                  key={slot.id}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <Checkbox
                                    id={`slot-${slot.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleSlot(slot.id, false)
                                    }
                                    disabled={!canSelect}
                                  />
                                  <Label
                                    htmlFor={`slot-${slot.id}`}
                                    className="text-sm font-normal cursor-pointer flex items-center gap-1"
                                  >
                                    <Clock className="h-3 w-3" />
                                    {slot.hour}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {errors.slot_ids && (
                  <p className="text-sm text-destructive">
                    {errors.slot_ids.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isSubmitting ||
                    selectedSlots.length === 0 ||
                    selectedSlots.length > student.max_slots
                  }
                >
                  {isSubmitting
                    ? "Zapisuję..."
                    : `Zapisz rezerwacje (${selectedSlots.length}/${student.max_slots})`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
