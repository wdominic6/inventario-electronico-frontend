export const catalogos = {
 products: { title:'Productos electrónicos', fields:[
  {key:'sku',label:'Código SKU',required:true,maxlength:50},{key:'barcode',label:'Código de barras'},
  {key:'name',label:'Nombre',required:true},{key:'category_id',label:'Categoría (ID)',type:'number',required:true,min:1},
  {key:'brand',label:'Marca',required:true},{key:'model',label:'Modelo'},
  {key:'unit',label:'Unidad de medida',required:true},{key:'min_stock',label:'Stock mínimo',type:'number',required:true,min:0},
  {key:'unit_cost',label:'Costo unitario',type:'number',required:true,min:0},
  {key:'unit_price',label:'Precio unitario',type:'number',required:true,min:0},
  {key:'specs',label:'Especificaciones (JSON)',type:'json',required:true},
  {key:'is_active',label:'Activo',type:'checkbox'}],
  columns:[{key:'sku',label:'SKU'},{key:'name',label:'Producto'},{key:'brand',label:'Marca'},{key:'total_stock',label:'Stock'}]
 },
 categories:{title:'Categorías',fields:[
  {key:'name',label:'Nombre',required:true},{key:'code_prefix',label:'Prefijo de código',required:true},
  {key:'description',label:'Descripción'}],
  columns:[{key:'name',label:'Nombre'},{key:'code_prefix',label:'Prefijo'},{key:'description',label:'Descripción'}]
 },
 branches:{title:'Sucursales',adminOnly:true,fields:[
  {key:'code',label:'Código',required:true},{key:'name',label:'Nombre',required:true},
  {key:'address',label:'Dirección'},{key:'phone',label:'Teléfono'},
  {key:'is_active',label:'Activa',type:'checkbox'}],
  columns:[{key:'code',label:'Código'},{key:'name',label:'Nombre'},{key:'address',label:'Dirección'}]
 },
 locations:{title:'Ubicaciones en estantería',fields:[
  {key:'branch_id',label:'ID de sucursal',type:'number',required:true,min:1},
  {key:'code',label:'Código de ubicación',required:true},
  {key:'shelf',label:'Estante',required:true},{key:'level',label:'Nivel',required:true},
  {key:'bin',label:'Casillero',required:true},{key:'description',label:'Descripción'}],
  columns:[{key:'code',label:'Código'},{key:'branch_id',label:'Sucursal'},{key:'shelf',label:'Estante'},{key:'level',label:'Nivel'},{key:'bin',label:'Casillero'}]
 },
 users:{title:'Gestión de usuarios',adminOnly:true,fields:[
  {key:'name',label:'Nombre completo',required:true},{key:'email',label:'Correo',type:'email',required:true},
  {key:'password',label:'Contraseña (en edición, dejar vacía para mantener)',type:'password',required:true},
  {key:'role',label:'Rol',type:'select',required:true,options:[{value:'admin',label:'Administrador'},{value:'almacen',label:'Almacén'},{value:'ventas',label:'Ventas'}]},
  {key:'branch_id',label:'ID de sucursal',type:'number',required:true,min:1},
  {key:'is_active',label:'Activo',type:'checkbox'}],
  columns:[{key:'name',label:'Nombre'},{key:'email',label:'Correo'},{key:'role',label:'Rol'},{key:'branch_name',label:'Sucursal'}]
 },
}
