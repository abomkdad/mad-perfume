#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
typedef int (__cdecl *init_fn)(int,const char*,int,const char*,const char*,void**);
typedef int (__cdecl *info_fn)(int,void*,const char*,int,char*);
typedef int (__cdecl *connect_fn)(int,void*,const char*,int,int*,const char*,const char*,const char*,const char*);
typedef int (__cdecl *uninit_fn)(int,void*);
static int line(char*b,size_t n){if(!fgets(b,(int)n,stdin))return 0;b[strcspn(b,"\r\n")]=0;return 1;}
static int field(const char*json,const char*name,char*out,size_t size){char key[128];snprintf(key,sizeof key,"\"%s\"",name);const char*p=strstr(json,key);if(!p)return 0;p=strchr(p+strlen(key),':');if(!p)return 0;while(*++p==' ');if(*p!='\"')return 0;p++;const char*e=strchr(p,'\"');if(!e||(size_t)(e-p)>=size)return 0;memcpy(out,p,e-p);out[e-p]=0;return 1;}
int main(){char server[256],guess[256],account[256],serial[128],user[128],password[256],portstr[32],info[8192]={0},salt[512]={0},version[128]="6.6.5",end[32];if(!line(server,sizeof server)||!line(guess,sizeof guess)||!line(account,sizeof account)||!line(serial,sizeof serial)||!line(user,sizeof user)||!line(password,sizeof password))return 2;
HMODULE lib=LoadLibraryA("P2PDll.dll");if(!lib){printf("MAD_ERROR load %lu\n",GetLastError());return 3;}init_fn init=(init_fn)GetProcAddress(lib,"P2P_Init");info_fn getinfo=(info_fn)GetProcAddress(lib,"P2P_GetDeviceInfo");connect_fn connect=(connect_fn)GetProcAddress(lib,"P2P_Connect");uninit_fn uninit=(uninit_fn)GetProcAddress(lib,"P2P_UnInit");if(!init||!getinfo||!connect||!uninit){puts("MAD_ERROR symbols");return 4;}void*handle=NULL;int result=init(0,server,8800,guess,account,&handle);if(result||!handle){printf("MAD_ERROR init %d\n",result);return 5;}
Sleep(3000);result=getinfo(0,handle,serial,sizeof info,info);if(result){printf("MAD_ERROR info %d bytes %zu json %d\n",result,strlen(info),info[0]=='{');uninit(0,handle);return 6;}printf("MAD_READY %s\n",info);fflush(stdout);
field(info,"randsalt",salt,sizeof salt);field(info,"devp2pver",version,sizeof version);
while(line(portstr,sizeof portstr)){
 if(!strcmp(portstr,"stop"))break;
 int remote=atoi(portstr);if(remote<1||remote>65535){puts("MAD_ERROR port");fflush(stdout);continue;}
 int port=0;result=connect(0,handle,serial,remote,&port,user,password,salt,version);
 if(result||port<=0)printf("MAD_ERROR connect %d\n",result);else printf("MAD_PORT %d\n",port);
 fflush(stdout);
}
uninit(0,handle);return 0;}
