import paystack from "paystack";
import { ENV_DATA } from "./envData";

const Paystack = paystack(ENV_DATA.PAYSTACK_KEY as string);

export default Paystack;
