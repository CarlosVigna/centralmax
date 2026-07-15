package br.com.centralmax.maxhub.push;

import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.util.Arrays;
import java.util.Base64;

public class VapidKeyGenerator {

    public static void main(String[] args) throws Exception {
        Security.addProvider(new BouncyCastleProvider());

        ECNamedCurveParameterSpec spec = ECNamedCurveTable.getParameterSpec("prime256v1");
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("ECDH", "BC");
        kpg.initialize(spec);
        KeyPair keyPair = kpg.generateKeyPair();

        ECPublicKey pub = (ECPublicKey) keyPair.getPublic();
        ECPrivateKey prv = (ECPrivateKey) keyPair.getPrivate();

        byte[] pubBytes = pub.getQ().getEncoded(false); // uncompressed 65 bytes
        byte[] prvRaw = prv.getD().toByteArray();
        if (prvRaw.length == 33 && prvRaw[0] == 0) {
            prvRaw = Arrays.copyOfRange(prvRaw, 1, 33);
        }

        String pubKey = Base64.getUrlEncoder().withoutPadding().encodeToString(pubBytes);
        String prvKey = Base64.getUrlEncoder().withoutPadding().encodeToString(prvRaw);

        System.out.println("=== VAPID Keys ===");
        System.out.println("VAPID_PUBLIC_KEY=" + pubKey);
        System.out.println("VAPID_PRIVATE_KEY=" + prvKey);
        System.out.println("Set these as environment variables in Railway.");
    }
}
