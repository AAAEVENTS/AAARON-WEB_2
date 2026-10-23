import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage as ndi
SRC='/home/claude/seal_in/SEAL COATINGS/'
OUT='/home/claude/AAARON_Premium_Official_2026/public/assets/seal/'
os.makedirs(OUT,exist_ok=True)
CW,CH=1000,800
MAP={  # slug: source file
 'thermal-shield-rf':'Thermal Shield RF (Roof).webp','thermal-shield-ind':'Thermal Shield IND (Industrial).webp',
 'thermal-shield-xt':'Thermal Shield XT (Exterior).png','thermal-shield-nt':'thermal-shield-nt.webp',
 'thermal-shield-marine':'SEAL THERMAL SHIELD MARINE.png','thermal-shield-pw':'Seal Thermal-Shield PW.png',
 'water-guard':'Seal Water Guard.webp','water-guard-pu-xtrm':'Seal Water Guard PU-XTRM.jpg','flexiproof':'Seal Flexiproof.webp',
 'acroprime':'SEAL ACROPRIME.png','metprime':'Seal Metprime.png','anticarbon':'SEAL ANTICARBON.png',
 'elegantex':'SEAL ELEGANTEX.png','elegantin':'SEAL ELEGANTIN.png',
 'elegantex-vintage':'SEAL ELEGANTEX VINTAGE.png','elegantin-plus':'SEAL ELEGANTIN PLUS.jpg',
 'thermal-plast-nt':'Seal Thermal Plast NT.webp','thermal-plast-xt':'Seal Thermal-Plast XT.png','stucco-plast':'Seal Stucco Fine.png'}
def gradient_canvas():
    t=np.linspace(0,1,CH,dtype=np.float32)[:,None,None]
    top=np.array([246,248,249],np.float32); bot=np.array([221,228,233],np.float32)
    return np.broadcast_to(top*(1-t)+bot*t,(CH,CW,3)).copy()
def drop_corner_badge(mask):
    """remove small components in the bottom-right (the 'SEAL COATINGS' label)"""
    h,w=mask.shape; dil=ndi.binary_dilation(mask,iterations=6)
    lab,n=ndi.label(dil); out=mask.copy()
    for i in range(1,n+1):
        ys,xs=np.where(lab==i)
        if xs.mean()>0.68*w and ys.mean()>0.80*h and len(xs)<0.12*mask.size:
            out[lab==i]=False
    return out
def fit_onto_canvas(rgb, mask, pad=0.86):
    ys,xs=np.where(mask); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    crop=rgb[y0:y1,x0:x1]; m=mask[y0:y1,x0:x1]
    s=min(CW*pad/crop.shape[1],CH*pad/crop.shape[0]); s=min(s,1.6)
    return crop,m,s
res={}
for slug,f in MAP.items():
    im=Image.open(SRC+f); rgba=np.array(im.convert('RGBA')).astype(np.float32)
    rgb=rgba[...,:3]; a=rgba[...,3]/255.0
    h,w=a.shape
    transparent=a.min()<0.5
    corner=np.median(np.concatenate([rgb[:6,:6].reshape(-1,3),rgb[:6,-6:].reshape(-1,3),rgb[-6:,:6].reshape(-1,3),rgb[-6:,-6:].reshape(-1,3)]),axis=0)
    white=(corner.min()>245)
    kind='alpha' if transparent else ('white' if white else 'opaque')
    if slug=='metprime': kind='photo'
    if kind in('alpha','white'):
        if kind=='alpha': mask=a>0.08
        else:
            diff=np.abs(255-rgb).max(axis=2); mask=diff>14
        if slug=='water-guard-pu-xtrm':   # clean black smears left by a bad cut-out
            lum=rgb.mean(axis=2); dark=lum<70
            lab,n=ndi.label(dark)
            kill=np.zeros_like(dark)
            for i in range(1,n+1):
                if (lab==i).sum()>1200: kill|=(lab==i)
            kill=ndi.binary_dilation(kill,iterations=4)
            rgb[kill]=255; mask=mask&~kill
            mask=ndi.binary_opening(mask,iterations=2)
        # remove the corner 'SEAL COATINGS' badge by its flat brand-blue colour
        ys0,xs0=np.mgrid[0:h,0:w]
        region=(xs0>0.55*w)&(ys0>0.78*h)
        bd=(np.abs(rgb-np.array([52,92,140],np.float32)).max(axis=2)<42)&region&(a>0.5)
        if bd.sum()>800:
            lab,n=ndi.label(ndi.binary_dilation(bd,iterations=3))
            big=np.argmax(ndi.sum(bd,lab,range(1,n+1)))+1
            yy,xx=np.where(lab==big); p=6
            mask[max(0,yy.min()-p):yy.max()+p,max(0,xx.min()-p):xx.max()+p]=False
            a[max(0,yy.min()-p):yy.max()+p,max(0,xx.min()-p):xx.max()+p]=0
            rgb[max(0,yy.min()-p):yy.max()+p,max(0,xx.min()-p):xx.max()+p]=255 if kind=='white' else rgb[max(0,yy.min()-p):yy.max()+p,max(0,xx.min()-p):xx.max()+p]
        mask=ndi.binary_opening(mask,iterations=1)
        mask=drop_corner_badge(mask)
        # also clear badge pixels from the image so they don't reappear
        keep=ndi.binary_dilation(mask,iterations=10)
        crop,m,s=fit_onto_canvas(rgb,keep)
        ys,xs=np.where(keep); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        c=rgb[y0:y1,x0:x1]; al=a[y0:y1,x0:x1]; kp=keep[y0:y1,x0:x1]
        nw,nh=int(c.shape[1]*s),int(c.shape[0]*s)
        c=cv2.resize(c,(nw,nh),interpolation=cv2.INTER_AREA if s<1 else cv2.INTER_CUBIC)
        al=cv2.resize(al,(nw,nh),interpolation=cv2.INTER_AREA if s<1 else cv2.INTER_CUBIC)
        kp=cv2.resize(kp.astype(np.float32),(nw,nh))>0.5
        canvas=gradient_canvas()
        ox,oy=(CW-nw)//2,int((CH-nh)*0.5)
        reg=canvas[oy:oy+nh,ox:ox+nw]
        if kind=='alpha':
            blend=al*kp
            reg[:]=reg*(1-blend[...,None])+c*blend[...,None]
        else:  # white background -> multiply so the white vanishes into the gradient
            c2=c.copy(); c2[~kp]=255
            reg[:]=reg*(c2/255.0)
        if slug=='water-guard-pu-xtrm':
            fade=np.clip((np.arange(CH)-0.80*CH)/(0.10*CH),0,1)[:,None,None]
            out0=gradient_canvas(); canvas=canvas*(1-fade)+out0*fade
        out=canvas
    else:
        # opaque studio shot or photo: crop a 5:4 window around the content, replicate edges if needed
        if kind=='photo':
            sc=max(CW/w,CH/h); r=cv2.resize(rgb,(int(w*sc+1),int(h*sc+1)),interpolation=cv2.INTER_AREA)
            x0=int((r.shape[1]-CW)*0.75); y0=int((r.shape[0]-CH)*0.5); out=r[y0:y0+CH,x0:x0+CW]
        else:
            diff=np.abs(rgb-corner).max(axis=2); mask=ndi.binary_opening(diff>38,iterations=2)
            ys,xs=np.where(mask); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
            bw,bh=x1-x0,y1-y0; ww=max(bw*1.16,bh*1.16*1.25); wh=ww/1.25
            cx,cy=(x0+x1)/2,(y0+y1)/2
            L,T=int(cx-ww/2),int(cy-wh/2); R,B=int(cx+ww/2),int(cy+wh/2)
            pad=max(0,-L,-T,R-w,B-h)
            if pad>0: rgbp=cv2.copyMakeBorder(rgb,pad,pad,pad,pad,cv2.BORDER_REPLICATE); L+=pad;T+=pad;R+=pad;B+=pad
            else: rgbp=rgb
            win=rgbp[T:B,L:R]; out=cv2.resize(win,(CW,CH),interpolation=cv2.INTER_AREA)
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(OUT+slug+'.webp',quality=82,method=6)
    res[slug]=(kind,os.path.getsize(OUT+slug+'.webp')//1024)
for k,v in res.items(): print(k,v)
# contact sheet
sheet=Image.new('RGB',(5*340,4*280),'#777')
for i,s in enumerate(MAP):
    t=Image.open(OUT+s+'.webp').resize((330,264)); sheet.paste(t,((i%5)*340+5,(i//5)*280+5))
sheet.save('/home/claude/work/out/seal_processed.png')
