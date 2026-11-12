from PIL import Image, ImageDraw, ImageFont
import math, os
S = 4; N = 512
FONT = './assets/fonts/Inter-900.otf'

class C:
    def __init__(s):
        s.im = Image.new('RGBA', (N*S, N*S), (0,0,0,0)); s.d = ImageDraw.Draw(s.im)
    def _p(s, pts): return [(x*S, y*S) for x, y in pts]
    def rr(s, b, r, fill, outline=None, w=0):
        s.d.rounded_rectangle([b[0]*S, b[1]*S, b[2]*S, b[3]*S], r*S, fill=fill, outline=outline, width=int(w*S))
    def el(s, b, fill, outline=None, w=0):
        s.d.ellipse([b[0]*S, b[1]*S, b[2]*S, b[3]*S], fill=fill, outline=outline, width=int(w*S))
    def poly(s, pts, fill): s.d.polygon(s._p(pts), fill=fill)
    def line(s, pts, fill, w, joint='curve'):
        s.d.line(s._p(pts), fill=fill, width=int(w*S), joint=joint)
        for x, y in (pts[0], pts[-1]): s.el((x-w/2, y-w/2, x+w/2, y+w/2), fill)
    def arc(s, b, a0, a1, fill, w):
        s.d.arc([b[0]*S, b[1]*S, b[2]*S, b[3]*S], a0, a1, fill=fill, width=int(w*S))
    def pie(s, b, a0, a1, fill): s.d.pieslice([b[0]*S, b[1]*S, b[2]*S, b[3]*S], a0, a1, fill=fill)
    def text(s, xy, t, size, fill):
        f = ImageFont.truetype(FONT, int(size*S)); s.d.text((xy[0]*S, xy[1]*S), t, font=f, fill=fill, anchor='mm')
    def save(s, name, out=160):
        im = s.im.resize((out, out), Image.LANCZOS); im.save(f'./assets/emoji/{name}.png', optimize=True)

def circle(c, cx, cy, r, fill): c.el((cx-r, cy-r, cx+r, cy+r), fill)

def fuel():
    c = C()
    c.rr((110, 70, 330, 450), 28, '#E5384F'); c.rr((110, 400, 330, 450), 20, '#7A1B2B')
    c.rr((150, 110, 290, 220), 14, '#BFEFFF'); c.rr((150, 110, 290, 150), 10, '#FFFFFF')
    c.rr((160, 250, 280, 285), 10, '#FFC83D'); c.rr((160, 310, 240, 335), 10, '#7A1B2B')
    c.line([(330, 160), (385, 160), (385, 310)], '#2B3350', 26)
    c.rr((365, 300, 425, 345), 12, '#2B3350'); c.line([(395, 340), (395, 380)], '#2B3350', 20)
    return c
def motor():
    c = C()
    for cx in (130, 390):
        circle(c, cx, 350, 82, '#1B2340'); circle(c, cx, 350, 50, '#BFC9E0'); circle(c, cx, 350, 18, '#1B2340')
    c.line([(130, 350), (230, 230), (330, 230), (390, 350)], '#FF7A1A', 24)
    c.line([(230, 230), (290, 350), (390, 350)], '#E86400', 20)
    c.rr((190, 190, 320, 232), 16, '#1B2340')
    c.rr((330, 150, 450, 200), 12, '#FF7A1A'); c.line([(340, 230), (370, 150)], '#1B2340', 18)
    circle(c, 440, 185, 24, '#FFE066'); c.rr((120, 215, 190, 245), 10, '#E86400')
    return c
def worker():
    c = C()
    c.rr((110, 300, 402, 470), 60, '#FF8A1F'); c.rr((226, 300, 286, 470), 0, '#FFE066')
    c.rr((150, 380, 362, 405), 10, '#FFE066')
    circle(c, 256, 230, 90, '#F2B68A')
    c.pie((136, 80, 376, 320), 180, 360, '#FFD23F'); c.rr((116, 195, 396, 235), 18, '#F5B800')
    c.rr((226, 70, 286, 150), 12, '#F5B800')
    circle(c, 222, 245, 9, '#2B2220'); circle(c, 290, 245, 9, '#2B2220')
    c.arc((218, 250, 294, 300), 20, 160, '#8A4B2A', 7)
    return c
def build():
    c = C()
    c.rr((60, 440, 452, 470), 8, '#5A6B96')
    c.rr((90, 270, 250, 440), 10, '#8FA3D1')
    for r in range(3):
        for k in range(2): c.rr((110+k*68, 292+r*50, 150+k*68, 322+r*50), 4, '#FFE9A8')
    c.line([(350, 440), (350, 90)], '#FFC83D', 22); c.line([(350, 90), (130, 90)], '#FFC83D', 20)
    c.line([(350, 90), (440, 90)], '#FFC83D', 20)
    c.line([(350, 90), (200, 180)], '#E8A800', 8); c.line([(350, 90), (270, 90)], '#E8A800', 6)
    c.line([(150, 96), (150, 190)], '#2B3350', 6); c.rr((126, 190, 174, 226), 8, '#E5384F')
    for y in range(130, 440, 60): c.line([(338, y), (362, y+30)], '#E8A800', 5)
    return c
def rain():
    c = C()
    for (cx, cy, r) in [(170, 200, 90), (270, 160, 110), (370, 210, 80)]: circle(c, cx, cy, r, '#C9D4EC')
    c.rr((110, 200, 440, 290), 45, '#C9D4EC')
    for x, y in [(170, 340), (250, 390), (330, 340), (410, 390)]:
        c.line([(x, y), (x-24, y+60)], '#3FA9FF', 20)
    return c
def pause():
    c = C()
    circle(c, 256, 256, 200, '#FFC83D'); circle(c, 256, 256, 160, '#FFD966')
    c.rr((190, 160, 238, 352), 10, '#6A4A00'); c.rr((274, 160, 322, 352), 10, '#6A4A00')
    return c
def book():
    c = C()
    c.rr((120, 70, 400, 450), 22, '#1F6BFF'); c.rr((120, 70, 160, 450), 14, '#0B3FA8')
    c.rr((350, 90, 392, 430), 8, '#F4F7FF')
    c.rr((190, 130, 330, 190), 10, '#BFEFFF')
    c.rr((190, 220, 300, 240), 8, '#8FB2FF'); c.rr((190, 262, 300, 282), 8, '#8FB2FF')
    c.poly([(300, 70), (336, 70), (336, 160), (318, 142), (300, 160)], '#FF4D6D')
    return c
def money():
    c = C()
    c.pie((90, 140, 422, 470), 0, 360, '#C98A3D'); c.rr((100, 330, 412, 470), 70, '#C98A3D')
    circle(c, 256, 340, 150, '#D99A4A')
    c.poly([(200, 90), (240, 150), (272, 150), (312, 90), (280, 120), (256, 80), (232, 120)], '#D99A4A')
    c.rr((176, 135, 336, 175), 14, '#8A5A1E')
    c.text((256, 330), 'Rp', 108, '#FFF1C2')
    return c
def person():
    c = C()
    circle(c, 256, 130, 70, '#F2B68A'); c.pie((186, 55, 326, 195), 180, 360, '#2B2220')
    c.rr((160, 215, 352, 340), 50, '#1F9BFF'); c.rr((200, 320, 250, 460), 14, '#27336B'); c.rr((262, 320, 312, 460), 14, '#27336B')
    c.rr((200, 440, 250, 470), 10, '#1B2340'); c.rr((262, 440, 312, 470), 10, '#1B2340')
    c.rr((120, 225, 168, 345), 22, '#1F9BFF'); c.rr((344, 225, 392, 345), 22, '#1F9BFF')
    return c
def pizza():
    c = C()
    c.poly([(256, 450), (60, 140), (452, 140)], '#FFC83D')
    c.rr((50, 100, 462, 160), 28, '#D9822B')
    for (x, y, r) in [(256, 200, 28), (190, 250, 24), (320, 250, 24), (256, 320, 22)]: circle(c, x, y, r, '#E5384F')
    c.line([(256, 450), (256, 400)], '#E8A800', 6)
    circle(c, 150, 130, 8, '#F2A85B'); circle(c, 256, 128, 8, '#F2A85B'); circle(c, 362, 130, 8, '#F2A85B')
    return c
def shirt():
    c = C()
    c.poly([(170, 80), (342, 80), (470, 170), (410, 260), (366, 230), (366, 440), (146, 440), (146, 230), (102, 260), (42, 170)], '#1FC7E0')
    c.pie((196, 40, 316, 160), 0, 180, '#0E8FA6')
    c.rr((146, 400, 366, 440), 6, '#0E8FA6')
    c.rr((210, 230, 302, 330), 14, '#BFEFFF')
    return c
def timer():
    c = C()
    c.rr((226, 40, 286, 90), 10, '#5A6B96'); c.rr((200, 30, 312, 60), 12, '#8FA3D1')
    circle(c, 256, 290, 190, '#8FA3D1'); circle(c, 256, 290, 160, '#F4F7FF')
    for a in range(0, 360, 30):
        x1 = 256 + 138*math.cos(math.radians(a)); y1 = 290 + 138*math.sin(math.radians(a))
        x2 = 256 + 152*math.cos(math.radians(a)); y2 = 290 + 152*math.sin(math.radians(a))
        c.line([(x1, y1), (x2, y2)], '#5A6B96', 8)
    c.pie((96, 130, 416, 450), -90, -20, '#FF8AB5')
    c.line([(256, 290), (256, 175)], '#1B2340', 14); c.line([(256, 290), (330, 255)], '#1B2340', 14)
    circle(c, 256, 290, 16, '#E5384F')
    return c
def wind():
    c = C()
    c.line([(60, 170), (300, 170)], '#8FD3FF', 28); c.arc((250, 90, 400, 240), -90, 120, '#8FD3FF', 28)
    c.line([(40, 270), (360, 270)], '#BFEFFF', 28); c.arc((310, 210, 450, 350), -90, 120, '#BFEFFF', 28)
    c.line([(100, 370), (270, 370)], '#8FD3FF', 28); c.arc((230, 320, 340, 430), -90, 120, '#8FD3FF', 28)
    return c
def rice():
    c = C()
    c.pie((90, 120, 422, 400), 180, 360, '#F4F7FF'); c.rr((90, 240, 422, 280), 8, '#F4F7FF')
    circle(c, 200, 190, 14, '#DDE4F5'); circle(c, 270, 160, 14, '#DDE4F5'); circle(c, 320, 205, 14, '#DDE4F5')
    c.pie((60, 220, 452, 470), 0, 180, '#E5384F'); c.rr((60, 215, 452, 255), 14, '#B71F37')
    c.rr((210, 455, 302, 475), 8, '#7A1B2B')
    return c
def luggage():
    c = C()
    c.rr((190, 50, 322, 140), 22, None, '#5A3A1A', 22); c.rr((190, 50, 322, 140), 22, None, '#7A4B1E', 22)
    c.rr((70, 120, 442, 440), 46, '#B5651D'); c.rr((70, 120, 442, 170), 30, '#C97A2C')
    c.rr((130, 120, 170, 440), 0, '#7A4B1E'); c.rr((342, 120, 382, 440), 0, '#7A4B1E')
    c.rr((226, 260, 286, 320), 10, '#FFD23F'); c.rr((240, 276, 272, 304), 4, '#8A5A1E')
    return c
def grain():
    c = C()
    c.line([(256, 470), (256, 120)], '#C9A227', 14)
    for i in range(6):
        y = 130 + i*58
        for sx in (-1, 1):
            cx = 256 + sx*52; 
            c.el((cx-26, y-10, cx+26, y+60) if False else (cx-24, y-18, cx+24, y+50), '#FFC83D')
    c.el((232, 40, 280, 130), '#FFC83D')
    return c
def bento():
    c = C()
    c.rr((50, 110, 462, 410), 36, '#2B3350'); c.rr((70, 130, 442, 390), 22, '#F4F7FF')
    c.rr((85, 145, 250, 255), 14, '#FFD966'); c.rr((262, 145, 427, 255), 14, '#7FDB6A')
    c.rr((85, 267, 250, 375), 14, '#FF8AB5'); c.rr((262, 267, 427, 375), 14, '#FF9F43')
    circle(c, 168, 200, 30, '#FFF1C2'); circle(c, 345, 200, 28, '#2E9E3E'); circle(c, 168, 320, 30, '#FFC2DA'); circle(c, 345, 320, 30, '#FFD9A8')
    return c
def pump():
    c = C()
    c.rr((220, 60, 292, 210), 22, '#8FA3D1'); c.rr((150, 40, 362, 90), 20, '#5A6B96')
    c.line([(256, 190), (256, 260), (390, 260), (390, 300)], '#8FA3D1', 54)
    c.rr((354, 290, 426, 330), 10, '#5A6B96')
    c.poly([(390, 370), (352, 430), (428, 430)], '#3FA9FF'); circle(c, 390, 430, 38, '#3FA9FF')
    c.rr((90, 440, 340, 470), 10, '#3FA9FF')
    return c
def pool():
    c = C()
    c.rr((50, 150, 462, 440), 40, '#1F9BFF'); c.rr((50, 150, 462, 200), 30, '#8FD3FF')
    for y in (270, 350):
        c.arc((90, y-30, 190, y+40), 180, 360, '#BFEFFF', 18); c.arc((190, y-30, 290, y+40), 180, 360, '#BFEFFF', 18); c.arc((290, y-30, 390, y+40), 180, 360, '#BFEFFF', 18)
    c.line([(100, 160), (100, 70), (150, 70)], '#E6EEF9', 14); c.line([(160, 160), (160, 70), (150, 70)], '#E6EEF9', 14)
    return c
def school():
    c = C()
    c.rr((60, 200, 452, 450), 14, '#E5584F'); c.poly([(40, 210), (256, 90), (472, 210)], '#B71F37')
    c.rr((222, 330, 290, 450), 12, '#5A2A1E')
    for x in (100, 170, 300, 370): c.rr((x, 250, x+44, 300), 6, '#FFE9A8'); c.rr((x, 340, x+44, 390), 6, '#FFE9A8')
    c.line([(256, 100), (256, 20)], '#5A6B96', 10); c.poly([(260, 20), (340, 44), (260, 68)], '#FFC83D')
    c.el((226, 140, 286, 200), '#F4F7FF')
    return c

ICONS = dict(fuel=fuel, motor=motor, worker=worker, build=build, rain=rain, pause=pause, book=book, money=money,
             person=person, pizza=pizza, shirt=shirt, timer=timer, wind=wind, rice=rice, luggage=luggage,
             grain=grain, bento=bento, pump=pump, pool=pool, school=school)
for n, f in ICONS.items(): f().save(n)
# lembar kontak untuk pengecekan visual
sheet = Image.new('RGBA', (5*180, 4*180), (3, 20, 60, 255))
for i, n in enumerate(ICONS):
    im = Image.open(f'./assets/emoji/{n}.png'); sheet.alpha_composite(im, ((i%5)*180+10, (i//5)*180+10))
sheet.convert('RGB').save('/tmp/emoji_sheet.png')
print(sum(os.path.getsize(f'./assets/emoji/{n}.png') for n in ICONS)//1024, 'KB')
