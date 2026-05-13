import { z } from 'zod';

// Checkout validation schema
export const checkoutSchema = z.object({
  fullName: z.string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Nome deve conter apenas letras" }),
  
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email não pode exceder 255 caracteres" }),
  
  phone: z.string()
    .trim()
    .min(9, { message: "Telefone inválido" })
    .max(20, { message: "Telefone não pode exceder 20 caracteres" })
    .regex(/^[+\d\s()-]+$/, { message: "Telefone deve conter apenas números e caracteres especiais válidos" }),
  
  address: z.string()
    .trim()
    .min(10, { message: "Endereço deve ter pelo menos 10 caracteres" })
    .max(500, { message: "Endereço não pode exceder 500 caracteres" }),
  
  city: z.string()
    .trim()
    .min(2, { message: "Cidade deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Cidade não pode exceder 100 caracteres" }),
  
  postalCode: z.string()
    .trim()
    .optional(),
  
  paymentMethod: z.union([
    z.literal('bank-transfer'),
    z.literal('multicaixa'),
    z.literal('credit-card')
  ]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: "Nome do produto deve ter pelo menos 3 caracteres" })
    .max(200, { message: "Nome não pode exceder 200 caracteres" }),
  
  description: z.string()
    .trim()
    .max(2000, { message: "Descrição não pode exceder 2000 caracteres" })
    .optional(),
  
  price: z.number()
    .positive({ message: "Preço deve ser maior que zero" })
    .max(999999999, { message: "Preço muito alto" }),
  
  original_price: z.number()
    .positive({ message: "Preço original deve ser maior que zero" })
    .max(999999999, { message: "Preço muito alto" })
    .optional()
    .nullable(),
  
  image_url: z.string()
    .trim()
    .url({ message: "URL de imagem inválida" })
    .max(500, { message: "URL não pode exceder 500 caracteres" }),
  
  stock_quantity: z.number()
    .int({ message: "Quantidade deve ser um número inteiro" })
    .min(0, { message: "Quantidade não pode ser negativa" })
    .max(999999, { message: "Quantidade muito alta" }),
  
  category_id: z.string().uuid({ message: "ID de categoria inválido" }).optional().nullable(),
  brand_id: z.string().uuid({ message: "ID de marca inválido" }).optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// News validation schema
export const newsSchema = z.object({
  title: z.string()
    .trim()
    .min(5, { message: "Título deve ter pelo menos 5 caracteres" })
    .max(200, { message: "Título não pode exceder 200 caracteres" }),
  
  description: z.string()
    .trim()
    .max(500, { message: "Descrição não pode exceder 500 caracteres" })
    .optional(),
  
  content: z.string()
    .trim()
    .max(10000, { message: "Conteúdo não pode exceder 10000 caracteres" })
    .optional(),
  
  image_url: z.string()
    .trim()
    .url({ message: "URL de imagem inválida" })
    .max(500, { message: "URL não pode exceder 500 caracteres" })
    .optional(),
  
  video_url: z.string()
    .trim()
    .url({ message: "URL de vídeo inválida" })
    .max(500, { message: "URL não pode exceder 500 caracteres" })
    .optional(),
  
  product_id: z.string().uuid({ message: "ID de produto inválido" }).optional().nullable(),
});

export type NewsFormData = z.infer<typeof newsSchema>;

// Profile validation schema
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Nome deve conter apenas letras" }),
  
  phone: z.string()
    .trim()
    .min(9, { message: "Telefone inválido" })
    .max(20, { message: "Telefone não pode exceder 20 caracteres" })
    .regex(/^[+\d\s()-]+$/, { message: "Telefone deve conter apenas números" })
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
