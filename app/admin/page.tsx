"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  Calendar,
  User,
  LogOut,
  Plus,
  Copy,
  CheckCircle2,
  Edit,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  max_slots: number;
  unique_link: string;
  bookings: Array<{
    id: number;
    slots: {
      day: string;
      hour: string;
    };
  }>;
  bookings_count: number;
}

interface Slot {
  id: number;
  day: string;
  hour: string;
  is_booked: boolean;
  bookings?: Array<{
    student: {
      first_name: string;
      last_name: string;
    };
  }>;
}

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    max_slots: 1,
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Błąd podczas pobierania uczniów");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("[v0] Error fetching students:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy uczniów",
        variant: "destructive",
      });
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/slots/all");
      if (!response.ok) throw new Error("Błąd podczas pobierania slotów");
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error("[v0] Error fetching slots:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać terminów",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie pola",
        variant: "destructive",
      });
      return;
    }

    setIsAddingStudent(true);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });

      if (!response.ok) throw new Error("Błąd podczas dodawania ucznia");

      toast({
        title: "Uczeń dodany",
        description: `${newStudent.first_name} ${newStudent.last_name} został dodany`,
      });

      setNewStudent({ first_name: "", last_name: "", max_slots: 1 });
      fetchStudents();
      fetchSlots();
    } catch (error) {
      toast({
        title: "Błąd",
        description:
          error instanceof Error ? error.message : "Nie udało się dodać ucznia",
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;

    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editingStudent.first_name,
          last_name: editingStudent.last_name,
          max_slots: editingStudent.max_slots,
        }),
      });

      if (!response.ok) throw new Error("Błąd podczas edycji ucznia");

      toast({
        title: "Uczeń zaktualizowany",
        description: `Dane ucznia zostały zaktualizowane`,
      });

      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast({
        title: "Błąd",
        description:
          error instanceof Error
            ? error.message
            : "Nie udało się zaktualizować ucznia",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Błąd podczas usuwania ucznia");

      toast({
        title: "Uczeń usunięty",
        description: "Uczeń i wszystkie jego rezerwacje zostały usunięte",
      });

      fetchStudents();
      fetchSlots();
    } catch (error) {
      toast({
        title: "Błąd",
        description:
          error instanceof Error
            ? error.message
            : "Nie udało się usunąć ucznia",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({
        title: "Wylogowano",
        description: "Do zobaczenia!",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wylogować",
        variant: "destructive",
      });
    }
  };

  const copyLink = (link: string) => {
    const fullLink = `${window.location.origin}/book/${link}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(link);
    toast({
      title: "Link skopiowany",
      description: "Link został skopiowany do schowka",
    });
    setTimeout(() => setCopiedLink(null), 2000);
  };

  useEffect(() => {
    fetchStudents();
    fetchSlots();
  }, []);

  const totalBookings = students.reduce(
    (sum, student) => sum + student.bookings_count,
    0
  );
  const freeSlots = slots.filter((slot) => !slot.is_booked).length;

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const dayOrder = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
  ];

  return (
    <div className="min-h-screen bg-background mb-32">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Panel Admina</h1>
              <p className="text-muted-foreground mt-1">
                Zarządzanie uczniami i rezerwacjami
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Liczba uczniów
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Zarejestrowanych uczniów
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wszystkie rezerwacje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Łączna liczba rezerwacji
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wolne sloty</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freeSlots}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Dostępnych terminów
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kalendarz zajęć</CardTitle>
            <CardDescription>
              Przegląd wszystkich terminów i rezerwacji
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Ładowanie kalendarza...
              </p>
            ) : (
              <div className="space-y-6">
                {dayOrder.map((day) => {
                  const daySlots = groupedSlots[day] || [];
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={day}>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {day}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg border-2 ${
                              slot.is_booked
                                ? "bg-accent/10 border-accent"
                                : "bg-muted/50 border-muted"
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {slot.hour}
                            </div>
                            {slot.is_booked &&
                            slot.bookings &&
                            slot.bookings.length > 0 ? (
                              <div className="text-xs text-muted-foreground mt-1">
                                {slot.bookings[0].student.first_name}{" "}
                                {slot.bookings[0].student.last_name}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-1">
                                Wolny
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista uczniów</CardTitle>
                <CardDescription>
                  Zarządzaj uczniami i ich rezerwacjami
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj ucznia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj nowego ucznia</DialogTitle>
                    <DialogDescription>
                      Wprowadź dane ucznia i ustaw limit rezerwacji
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="first_name">Imię</Label>
                      <Input
                        id="first_name"
                        value={newStudent.first_name}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            first_name: e.target.value,
                          })
                        }
                        placeholder="Jan"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nazwisko</Label>
                      <Input
                        id="last_name"
                        value={newStudent.last_name}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            last_name: e.target.value,
                          })
                        }
                        placeholder="Kowalski"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_slots">
                        Maksymalna liczba terminów
                      </Label>
                      <Input
                        id="max_slots"
                        type="number"
                        min="1"
                        value={newStudent.max_slots}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            max_slots: Number.parseInt(e.target.value) || 1,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddStudent}
                      disabled={isAddingStudent}
                    >
                      {isAddingStudent ? "Dodawanie..." : "Dodaj ucznia"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Ładowanie uczniów...
              </p>
            ) : students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Brak uczniów. Dodaj pierwszego ucznia.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Max terminów</TableHead>
                      <TableHead>Rezerwacje</TableHead>
                      <TableHead>Zarezerwowane terminy</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.max_slots}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              student.bookings_count >= student.max_slots
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {student.bookings_count} / {student.max_slots}
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.bookings.length > 0 ? (
                            <div className="space-y-1">
                              {student.bookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className="flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {booking.slots.day} - {booking.slots.hour}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Brak
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="flex flex-row gap-2 items-center">
                          <span>{student.unique_link}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLink(student.unique_link)}
                            className="gap-2"
                          >
                            {copiedLink === student.unique_link ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Skopiowano
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Kopiuj
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog
                              open={editingStudent?.id === student.id}
                              onOpenChange={(open) =>
                                !open && setEditingStudent(null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingStudent(student)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edytuj ucznia</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edytuj ucznia</DialogTitle>
                                  <DialogDescription>
                                    Zmień dane ucznia
                                  </DialogDescription>
                                </DialogHeader>
                                {editingStudent && (
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <Label htmlFor="edit_first_name">
                                        Imię
                                      </Label>
                                      <Input
                                        id="edit_first_name"
                                        value={editingStudent.first_name}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            first_name: e.target.value,
                                          })
                                        }
                                        className="mt-2"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit_last_name">
                                        Nazwisko
                                      </Label>
                                      <Input
                                        id="edit_last_name"
                                        value={editingStudent.last_name}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            last_name: e.target.value,
                                          })
                                        }
                                        className="mt-2"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit_max_slots">
                                        Maksymalna liczba terminów
                                      </Label>
                                      <Input
                                        id="edit_max_slots"
                                        type="number"
                                        min="1"
                                        value={editingStudent.max_slots}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            max_slots:
                                              Number.parseInt(e.target.value) ||
                                              1,
                                          })
                                        }
                                        className="mt-2"
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button onClick={handleEditStudent}>
                                    Zapisz zmiany
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Usuń ucznia</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Czy na pewno chcesz usunąć tego ucznia?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Ta akcja spowoduje usunięcie ucznia{" "}
                                    {student.first_name} {student.last_name}{" "}
                                    oraz wszystkich jego rezerwacji. Terminy
                                    zostaną odblokowane.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteStudent(student.id)
                                    }
                                  >
                                    Usuń
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
