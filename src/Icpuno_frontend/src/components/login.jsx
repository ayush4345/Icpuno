import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '../state/userState';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as deda_backend_idl } from '../../../declarations/Icpuno_backend';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

const canisterId = process.env.CANISTER_ID_DEDA_BACKEND;

const agent = new HttpAgent();
agent.fetchRootKey().catch(err => {
  console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
  console.error(err);
});
const backend = Actor.createActor(deda_backend_idl, { agent, canisterId: canisterId });

const Login = () => {

    const [user, setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(false);

    const login = async () => {
        setLoading(true);
        try {

            let authClient = await AuthClient.create({
                idleOptions: {
                    idleTimeout: 1000 * 60 * 60
                }
            });
            await authClient.login({
                //identityProvider: `http://127.0.0.1:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
                identityProvider: `http://bd3sg-teaaa-aaaaa-qaaba-cai.localhost:4943`,
                onSuccess: async () => {
                    console.log("Login successful");
                    const identity = authClient.getIdentity().getPrincipal().toString();
                    console.log(identity)
                    const principal = Principal.fromText(identity);
                    console.log(principal)
                    try {
                        const balance = (await backend.get_balance(principal));
                        console.log(balance)
                        const result = await backend.login(principal);
                        console.log(result);
                        setUser({ id: principal, balance });
                    } catch (e) {
                        console.error('Error fetching balance or logging in:', e);
                    }

                },
            });
            /*if (await authClient.isAuthenticated()) {
              
              
            }*/
            /*if ('Err' in result) {
              throw new Error(result.Err);
            }*/

        } catch (err) {
            console.error('Error logging in:', err);
        }
        setLoading(false);
    }

    return (
        <div className="p-4">
            <button
                onClick={login}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded">
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {user.id && (
                <div className="mt-4">
                    Logged in as: {user.id.toString()} <br />
                    Balance: {user.balance.toString()}
                </div>
            )}
        </div>
    );
};

export default Login;