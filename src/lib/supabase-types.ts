export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      csv_dataset: {
        Row: {
          CodMun: number
          created_at: string
          created_by: string
          csv_url: string
          endereco: string
          fields: string[]
          id: number
          title: string
        }
        Insert: {
          CodMun: number
          created_at?: string
          created_by?: string
          csv_url: string
          endereco?: string
          fields: string[]
          id?: number
          title: string
        }
        Update: {
          CodMun?: number
          created_at?: string
          created_by?: string
          csv_url?: string
          endereco?: string
          fields?: string[]
          id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_csv_dataset_CodMun_fkey"
            columns: ["CodMun"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["CodMun"]
          },
        ]
      }
      info_user: {
        Row: {
          auth_id: string
          CodMun: number
          created_at: string
          email: string
          id: number
          nome: string | null
          raio_alerta: number | null
        }
        Insert: {
          auth_id: string
          CodMun: number
          created_at?: string
          email: string
          id?: number
          nome?: string | null
          raio_alerta?: number | null
        }
        Update: {
          auth_id?: string
          CodMun?: number
          created_at?: string
          email?: string
          id?: number
          nome?: string | null
          raio_alerta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_info_user_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_info_user_CodMun_fkey"
            columns: ["CodMun"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["CodMun"]
          },
        ]
      }
      municipios: {
        Row: {
          CodMun: number
          created_at: string
          faixa_pop: string
          nome: string
          pop_est: number
          regiao: string
          UF: string
        }
        Insert: {
          CodMun: number
          created_at?: string
          faixa_pop: string
          nome: string
          pop_est: number
          regiao: string
          UF: string
        }
        Update: {
          CodMun?: number
          created_at?: string
          faixa_pop?: string
          nome?: string
          pop_est?: number
          regiao?: string
          UF?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
