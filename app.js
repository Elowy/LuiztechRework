/* cPanel / Phusion Passenger belépési pont.
   A cPanel „Setup Node.js App" varázsló jellemzően az alkalmazás
   gyökerében lévő indítófájlt várja — ez egyszerűen betölti a
   tényleges szervert a server/ mappából. */
require('./server/server.js');
