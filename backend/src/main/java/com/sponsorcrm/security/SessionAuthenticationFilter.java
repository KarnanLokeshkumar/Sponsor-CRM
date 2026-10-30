package com.sponsorcrm.security;
import com.sponsorcrm.auth.*;
import jakarta.servlet.*;import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;import java.time.LocalDateTime;import java.util.List;
public class SessionAuthenticationFilter extends OncePerRequestFilter {
 private final AuthSessionRepository sessions;
 public SessionAuthenticationFilter(AuthSessionRepository sessions){this.sessions=sessions;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String header=request.getHeader("Authorization");
  if(header!=null&&header.startsWith("Bearer ")){String token=header.substring(7);sessions.findByTokenHash(TokenUtil.hash(token)).filter(s->s.getExpiresAt().isAfter(LocalDateTime.now())&&s.getUser().isActive()).ifPresent(s->{var user=s.getUser();var auth=new UsernamePasswordAuthenticationToken(user.getEmail(),null,List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole())));SecurityContextHolder.getContext().setAuthentication(auth);});}
  chain.doFilter(request,response);
 }
}
