import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserService } from "@/services";

export async function POST(request: Request) {
  try {
    const { name, email, password, provider } = await request.json();

    let hashedPassword: string | null = null;

    if (provider !== "google") {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required unless provider is Google" },
          { status: 400 }
        );
      }

      // Générer un salt et hasher le mot de passe
      const salt = await bcrypt.genSalt(10); // 10 = cost factor
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = {
      name,
      email,
      password: hashedPassword, // null si provider = google
      provider: provider || "credentials", // "credentials" par défaut
    };

    const res = await UserService.create(user);

    if (!res.success) {
      console.error("Error creating user:", res);
      return NextResponse.json({ res }, { status: 400 });
    }

    console.log("User created:", res);
    return NextResponse.json({ res }, { status: 201 });
  } catch (e) {
    console.error("Error creating user:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
