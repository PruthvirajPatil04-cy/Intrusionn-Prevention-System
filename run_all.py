"""
Unified Orchestrator: Runs both the Next.js Web Portal and the Python Intrusion Detection Engine.
"""
import subprocess
import sys
import os
import signal
import time

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ids_dir = os.path.join(base_dir, "Intrusion-Detection_system")
    ipp_dir = os.path.join(base_dir, "ipp-blueprint")

    print("==================================================================")
    print("   INTRUSION PREVENTION SYSTEM & IPP BLUEPRINT UNIFIED RUNNER     ")
    print("==================================================================")
    print(f"[*] Engine Directory: {ids_dir}")
    print(f"[*] Portal Directory: {ipp_dir}")
    print("[*] Starting Web Portal (Next.js) on http://localhost:3000 ...")

    # Start Next.js portal
    portal_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ipp_dir,
        shell=True
    )

    time.sleep(2)

    print("[*] Starting Python Intrusion Detection Engine in SIMULATION mode...")
    # Start Python IDS/IPS engine
    engine_proc = subprocess.Popen(
        [sys.executable, "main.py", "--simulate"],
        cwd=ids_dir
    )

    print("\n[+] Both systems are active and running together!")
    print("[+] Press Ctrl+C at any time to shut down both processes.\n")

    try:
        while True:
            time.sleep(1)
            if portal_proc.poll() is not None:
                print("[-] Web portal terminated.")
                break
            if engine_proc.poll() is not None:
                print("[-] Python engine terminated.")
                break
    except KeyboardInterrupt:
        print("\n[*] Shutting down Intrusion Prevention System and Web Portal...")
    finally:
        try:
            portal_proc.terminate()
        except Exception:
            pass
        try:
            engine_proc.terminate()
        except Exception:
            pass
        print("[+] All services stopped safely.")

if __name__ == "__main__":
    main()
