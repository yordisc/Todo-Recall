from PIL import Image, ImageDraw

# Colores de Harvard
background_color = '#A51C30'  # Crimson (Harvard's primary color)
foreground_color = '#FFFFFF'  # Blanco para el texto y detalles del pato
duck_color = '#FFD700'        # Color amarillo para el pato

def create_icon(size):
    # Crear una nueva imagen con fondo del color de Harvard
    icon = Image.new('RGB', (size, size), color=background_color)
    draw = ImageDraw.Draw(icon)
    
    # Dibujar el checkmark simple en blanco
    checkmark = [(size // 8, size * 5 // 8), (size * 3 // 8, size * 7 // 8), (size * 7 // 8, size * 3 // 8)]
    draw.line(checkmark, fill=foreground_color, width=max(size // 16, 1))
    
    # Dibujar un pato de hule más definido
    # Cabeza
    head_radius = size // 8
    head_center = (size * 5 // 8, size // 8)
    draw.ellipse((head_center[0], head_center[1], head_center[0] + head_radius, head_center[1] + head_radius), fill=duck_color, outline=foreground_color)
    
    # Ojo
    eye_radius = head_radius // 4
    eye_center = (head_center[0] + head_radius // 2, head_center[1] + head_radius // 3)
    draw.ellipse((eye_center[0], eye_center[1], eye_center[0] + eye_radius, eye_center[1] + eye_radius), fill=foreground_color)
    
    # Pico
    beak_width = head_radius // 2
    beak_height = head_radius // 3
    draw.polygon([(head_center[0] + head_radius, head_center[1] + head_radius // 2),
                  (head_center[0] + head_radius + beak_width, head_center[1] + head_radius // 2 - beak_height // 2),
                  (head_center[0] + head_radius + beak_width, head_center[1] + head_radius // 2 + beak_height // 2)], fill=foreground_color)
    
    # Cuerpo
    body_radius = size // 4
    body_center = (size // 2, size // 2)
    draw.ellipse((body_center[0], body_center[1], body_center[0] + body_radius, body_center[1] + body_radius), fill=duck_color, outline=foreground_color)
    
    return icon

# Crear y guardar íconos en diferentes tamaños
sizes = [16, 48, 128]
for size in sizes:
    icon = create_icon(size)
    icon.save(f'D:\\documentos\\GitHub\\yordisc\\Final Project\\to-do-recall-cs50\\icons\\icon{size}.png')
