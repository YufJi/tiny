export interface Component {
   is: string;
   id: string;
   className: string;

   lifetimes: Record<string, any>;
}
