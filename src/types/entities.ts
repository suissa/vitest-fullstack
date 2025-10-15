export interface BaseEntity {
  id?: number | string
  createdAt?: Date
  updatedAt?: Date
}

export interface User extends BaseEntity {
  name: string
  email: string
}

export interface Product extends BaseEntity {
  name: string
  price: number
}

export interface Order extends BaseEntity {
  userId: number
  productId: number
  quantity: number
}
