/**
 * Cesium - https://github.com/AnalyticalGraphicsInc/cesium
 *
 * Copyright 2011-2017 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/AnalyticalGraphicsInc/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(["./defined-b9ff0e39","./Check-e6691f86","./freezeObject-2d5b18ce","./defaultValue-199f5aa8","./Math-92bd3539","./Cartesian2-8fa798b8","./defineProperties-ae15c9d5","./Transforms-9a355f42","./RuntimeError-d5522ee3","./WebGLConstants-554ddbe2","./ComponentDatatype-569c1e3e","./GeometryAttribute-27490d00","./when-c208a7cf","./GeometryAttributes-c3465b51","./IndexDatatype-7119db15","./GeometryOffsetAttribute-0abfa3f6","./EllipsoidRhumbLine-fb5cc30d","./PolygonPipeline-003684d7","./RectangleGeometryLibrary-93461fbb"],function(h,e,t,d,y,p,i,b,a,r,E,A,n,G,R,m,o,P,w){"use strict";var _=new b.BoundingSphere,v=new b.BoundingSphere,L=new p.Cartesian3,C=new p.Rectangle;function D(e,t){var i=e._ellipsoid,a=t.height,r=t.width,n=t.northCap,o=t.southCap,l=a,u=2,s=0,d=4;n&&(u-=1,l-=1,s+=1,d-=2),o&&(u-=1,l-=1,s+=1,d-=2),s+=u*r+2*l-d;var p,c=new Float64Array(3*s),f=0,g=0,h=L;if(n)w.RectangleGeometryLibrary.computePosition(t,i,!1,g,0,h),c[f++]=h.x,c[f++]=h.y,c[f++]=h.z;else for(p=0;p<r;p++)w.RectangleGeometryLibrary.computePosition(t,i,!1,g,p,h),c[f++]=h.x,c[f++]=h.y,c[f++]=h.z;for(p=r-1,g=1;g<a;g++)w.RectangleGeometryLibrary.computePosition(t,i,!1,g,p,h),c[f++]=h.x,c[f++]=h.y,c[f++]=h.z;if(g=a-1,!o)for(p=r-2;0<=p;p--)w.RectangleGeometryLibrary.computePosition(t,i,!1,g,p,h),c[f++]=h.x,c[f++]=h.y,c[f++]=h.z;for(p=0,g=a-2;0<g;g--)w.RectangleGeometryLibrary.computePosition(t,i,!1,g,p,h),c[f++]=h.x,c[f++]=h.y,c[f++]=h.z;for(var y=c.length/3*2,b=R.IndexDatatype.createTypedArray(c.length/3,y),m=0,_=0;_<c.length/3-1;_++)b[m++]=_,b[m++]=_+1;b[m++]=c.length/3-1,b[m++]=0;var v=new A.Geometry({attributes:new G.GeometryAttributes,primitiveType:A.PrimitiveType.LINES});return v.attributes.position=new A.GeometryAttribute({componentDatatype:E.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c}),v.indices=b,v}function c(e){var t=(e=d.defaultValue(e,d.defaultValue.EMPTY_OBJECT)).rectangle,i=d.defaultValue(e.granularity,y.CesiumMath.RADIANS_PER_DEGREE),a=d.defaultValue(e.ellipsoid,p.Ellipsoid.WGS84),r=d.defaultValue(e.rotation,0),n=d.defaultValue(e.height,0),o=d.defaultValue(e.extrudedHeight,n);this._rectangle=p.Rectangle.clone(t),this._granularity=i,this._ellipsoid=a,this._surfaceHeight=Math.max(n,o),this._rotation=r,this._extrudedHeight=Math.min(n,o),this._offsetAttribute=e.offsetAttribute,this._workerName="createRectangleOutlineGeometry"}c.packedLength=p.Rectangle.packedLength+p.Ellipsoid.packedLength+5,c.pack=function(e,t,i){return i=d.defaultValue(i,0),p.Rectangle.pack(e._rectangle,t,i),i+=p.Rectangle.packedLength,p.Ellipsoid.pack(e._ellipsoid,t,i),i+=p.Ellipsoid.packedLength,t[i++]=e._granularity,t[i++]=e._surfaceHeight,t[i++]=e._rotation,t[i++]=e._extrudedHeight,t[i]=d.defaultValue(e._offsetAttribute,-1),t};var f=new p.Rectangle,g=p.Ellipsoid.clone(p.Ellipsoid.UNIT_SPHERE),x={rectangle:f,ellipsoid:g,granularity:void 0,height:void 0,rotation:void 0,extrudedHeight:void 0,offsetAttribute:void 0};c.unpack=function(e,t,i){t=d.defaultValue(t,0);var a=p.Rectangle.unpack(e,t,f);t+=p.Rectangle.packedLength;var r=p.Ellipsoid.unpack(e,t,g);t+=p.Ellipsoid.packedLength;var n=e[t++],o=e[t++],l=e[t++],u=e[t++],s=e[t];return h.defined(i)?(i._rectangle=p.Rectangle.clone(a,i._rectangle),i._ellipsoid=p.Ellipsoid.clone(r,i._ellipsoid),i._surfaceHeight=o,i._rotation=l,i._extrudedHeight=u,i._offsetAttribute=-1===s?void 0:s,i):(x.granularity=n,x.height=o,x.rotation=l,x.extrudedHeight=u,x.offsetAttribute=-1===s?void 0:s,new c(x))};var H=new p.Cartographic;return c.createGeometry=function(e){var t,i,a=e._rectangle,r=e._ellipsoid,n=w.RectangleGeometryLibrary.computeOptions(a,e._granularity,e._rotation,0,C,H);if(!y.CesiumMath.equalsEpsilon(a.north,a.south,y.CesiumMath.EPSILON10)&&!y.CesiumMath.equalsEpsilon(a.east,a.west,y.CesiumMath.EPSILON10)){var o,l=e._surfaceHeight,u=e._extrudedHeight;if(!y.CesiumMath.equalsEpsilon(l,u,0,y.CesiumMath.EPSILON2)){if(t=function(e,t){var i=e._surfaceHeight,a=e._extrudedHeight,r=e._ellipsoid,n=a,o=i,l=D(e,t),u=t.height,s=t.width,d=P.PolygonPipeline.scaleToGeodeticHeight(l.attributes.position.values,o,r,!1),p=d.length,c=new Float64Array(2*p);c.set(d);var f=P.PolygonPipeline.scaleToGeodeticHeight(l.attributes.position.values,n,r);c.set(f,p),l.attributes.position.values=c;var g=t.northCap,h=t.southCap,y=4;g&&(y-=1),h&&(y-=1);var b=2*(c.length/3+y),m=R.IndexDatatype.createTypedArray(c.length/3,b);p=c.length/6;for(var _,v=0,E=0;E<p-1;E++)m[v++]=E,m[v++]=E+1,m[v++]=E+p,m[v++]=E+p+1;if(m[v++]=p-1,m[v++]=0,m[v++]=p+p-1,m[v++]=p,m[v++]=0,m[v++]=p,g)_=u-1;else{var A=s-1;m[v++]=A,m[v++]=A+p,_=s+u-2}if(m[v++]=_,m[v++]=_+p,!h){var G=s+_-1;m[v++]=G,m[v]=G+p}return l.indices=m,l}(e,n),h.defined(e._offsetAttribute)){var s=t.attributes.position.values.length/3,d=new Uint8Array(s);d=e._offsetAttribute===m.GeometryOffsetAttribute.TOP?m.arrayFill(d,1,0,s/2):(o=e._offsetAttribute===m.GeometryOffsetAttribute.NONE?0:1,m.arrayFill(d,o)),t.attributes.applyOffset=new A.GeometryAttribute({componentDatatype:E.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:d})}var p=b.BoundingSphere.fromRectangle3D(a,r,l,v),c=b.BoundingSphere.fromRectangle3D(a,r,u,_);i=b.BoundingSphere.union(p,c)}else{if((t=D(e,n)).attributes.position.values=P.PolygonPipeline.scaleToGeodeticHeight(t.attributes.position.values,l,r,!1),h.defined(e._offsetAttribute)){var f=t.attributes.position.values.length,g=new Uint8Array(f/3);o=e._offsetAttribute===m.GeometryOffsetAttribute.NONE?0:1,m.arrayFill(g,o),t.attributes.applyOffset=new A.GeometryAttribute({componentDatatype:E.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:g})}i=b.BoundingSphere.fromRectangle3D(a,r,l)}return new A.Geometry({attributes:t.attributes,indices:t.indices,primitiveType:A.PrimitiveType.LINES,boundingSphere:i,offsetAttribute:e._offsetAttribute})}},function(e,t){return h.defined(t)&&(e=c.unpack(e,t)),e._ellipsoid=p.Ellipsoid.clone(e._ellipsoid),e._rectangle=p.Rectangle.clone(e._rectangle),c.createGeometry(e)}});
