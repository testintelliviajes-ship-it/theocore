import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// GET → Listar agencias
export async function GET() {
  const { data, error } = await supabase
    .from("core_agencies")
    .select("*, core_brands(brand_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST → Crear agencia
export async function POST(req: Request) {
  const body = await req.json();
  const { error } = await supabase.from("core_agencies").insert([
    {
      name: body.name,
      email: body.email,
      country: body.country,
      domain: body.domain,
      brand_id: body.brand_id,
      logo_url: body.logo_url,
      status: "Invitada",
      is_active: true,
    },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH → Cambiar estado o activar/desactivar
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, data } = body;
  const { error } = await supabase.from("core_agencies").update(data).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE → Eliminar
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from("core_agencies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// INVITE → Generar token
export async function PUT(req: Request) {
  const { id } = await req.json();
  const token = randomUUID();
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/agency/invite?token=${token}`;

  const { error } = await supabase
    .from("core_agencies")
    .update({
      invitation_token: token,
      invitation_link: inviteUrl,
      status: "Pendiente",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inviteUrl });
}
